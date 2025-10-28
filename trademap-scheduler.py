#!/usr/bin/env python3
"""
Trade Map Data Scheduler
Schedules regular data extraction and ingestion from Trade Map
"""

import asyncio
import logging
import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import sys
import signal
import atexit

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TradeMapScheduler:
    """Scheduler for Trade Map data extraction and ingestion"""

    def __init__(self):
        self.data_dir = Path("./data/trademap")
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.config_dir = Path("./config")
        self.config_dir.mkdir(parents=True, exist_ok=True)

        self.logs_dir = Path("./logs")
        self.logs_dir.mkdir(parents=True, exist_ok=True)

        # Scheduler configuration
        self.config = {
            'extraction_interval_hours': 24,  # Daily extraction
            'retention_days': 90,  # Keep data for 90 days
            'max_concurrent_jobs': 3,
            'retry_attempts': 3,
            'retry_delay_minutes': 5,
            'notification_email': os.getenv('NOTIFICATION_EMAIL', ''),
            'slack_webhook': os.getenv('SLACK_WEBHOOK', '')
        }

        # Load configuration
        self.load_config()

        # Job tracking
        self.running_jobs = set()
        self.job_history = []
        self.shutdown_event = asyncio.Event()

        # Register signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        atexit.register(self.cleanup)

    def load_config(self):
        """Load scheduler configuration"""
        config_file = self.config_dir / 'scheduler_config.json'
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    loaded_config = json.load(f)
                    self.config.update(loaded_config)
                logger.info("Loaded scheduler configuration")
            except Exception as e:
                logger.error(f"Failed to load config: {e}")

    def save_config(self):
        """Save scheduler configuration"""
        config_file = self.config_dir / 'scheduler_config.json'
        try:
            with open(config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            logger.info("Saved scheduler configuration")
        except Exception as e:
            logger.error(f"Failed to save config: {e}")

    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.shutdown_event.set()

    def cleanup(self):
        """Cleanup function"""
        logger.info("Performing cleanup...")
        # Save job history
        self.save_job_history()

    def save_job_history(self):
        """Save job execution history"""
        history_file = self.logs_dir / 'job_history.json'
        try:
            with open(history_file, 'w') as f:
                json.dump(self.job_history[-100:], f, indent=2, default=str)  # Keep last 100 jobs
        except Exception as e:
            logger.error(f"Failed to save job history: {e}")

    def load_job_history(self):
        """Load job execution history"""
        history_file = self.logs_dir / 'job_history.json'
        if history_file.exists():
            try:
                with open(history_file, 'r') as f:
                    self.job_history = json.load(f)
                logger.info(f"Loaded {len(self.job_history)} job history records")
            except Exception as e:
                logger.error(f"Failed to load job history: {e}")

    async def run_extraction_job(self, job_config: Dict) -> Dict:
        """Run a single extraction job"""
        job_id = job_config.get('job_id', f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        start_time = datetime.now()

        logger.info(f"Starting extraction job: {job_id}")

        # Create job record
        job_record = {
            'job_id': job_id,
            'job_type': 'extraction',
            'config': job_config,
            'start_time': start_time.isoformat(),
            'status': 'running',
            'attempts': 0
        }

        try:
            # Run extraction with retries
            for attempt in range(self.config['retry_attempts']):
                job_record['attempts'] = attempt + 1

                try:
                    success = await self._execute_extraction(job_config)
                    if success:
                        job_record['status'] = 'completed'
                        job_record['end_time'] = datetime.now().isoformat()
                        job_record['duration_seconds'] = (datetime.now() - start_time).total_seconds()

                        # Run ingestion if extraction succeeded
                        await self.run_ingestion_job(job_config)

                        logger.info(f"Extraction job {job_id} completed successfully")
                        break
                    else:
                        raise Exception("Extraction failed")

                except Exception as e:
                    logger.warning(f"Extraction attempt {attempt + 1} failed: {e}")
                    if attempt < self.config['retry_attempts'] - 1:
                        await asyncio.sleep(self.config['retry_delay_minutes'] * 60)
                    else:
                        job_record['status'] = 'failed'
                        job_record['error'] = str(e)
                        job_record['end_time'] = datetime.now().isoformat()

        except Exception as e:
            logger.error(f"Extraction job {job_id} failed: {e}")
            job_record['status'] = 'failed'
            job_record['error'] = str(e)
            job_record['end_time'] = datetime.now().isoformat()

        finally:
            # Save job record
            self.job_history.append(job_record)
            self.save_job_history()

            # Send notifications if configured
            if job_record['status'] == 'failed':
                await self.send_failure_notification(job_record)

        return job_record

    async def _execute_extraction(self, job_config: Dict) -> bool:
        """Execute the actual extraction process"""
        try:
            # Run the extraction script
            cmd = [
                sys.executable,
                'trademap-extractor.py'
            ]

            # Add any job-specific arguments
            if 'countries' in job_config:
                # This would need to be implemented based on how we pass parameters
                pass

            # Run the command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=os.getcwd()
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                logger.info(f"Extraction completed successfully")
                if stdout:
                    logger.debug(f"Extraction stdout: {stdout.decode()}")
                return True
            else:
                logger.error(f"Extraction failed with return code {process.returncode}")
                if stderr:
                    logger.error(f"Extraction stderr: {stderr.decode()}")
                return False

        except Exception as e:
            logger.error(f"Failed to execute extraction: {e}")
            return False

    async def run_ingestion_job(self, job_config: Dict) -> Dict:
        """Run data ingestion job"""
        job_id = f"ingest_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        start_time = datetime.now()

        logger.info(f"Starting ingestion job: {job_id}")

        job_record = {
            'job_id': job_id,
            'job_type': 'ingestion',
            'config': job_config,
            'start_time': start_time.isoformat(),
            'status': 'running'
        }

        try:
            # Find the latest CSV files to ingest
            csv_files = list(self.data_dir.glob("trade_data_*.csv"))
            if not csv_files:
                logger.warning("No CSV files found for ingestion")
                job_record['status'] = 'skipped'
                job_record['message'] = 'No CSV files found'
                return job_record

            # Sort by modification time, get the latest
            latest_csv = max(csv_files, key=lambda f: f.stat().st_mtime)

            # Run ingestion
            success = await self._execute_ingestion(str(latest_csv))
            if success:
                job_record['status'] = 'completed'
                job_record['file_processed'] = str(latest_csv)
            else:
                job_record['status'] = 'failed'

        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")
            job_record['status'] = 'failed'
            job_record['error'] = str(e)

        finally:
            job_record['end_time'] = datetime.now().isoformat()
            job_record['duration_seconds'] = (datetime.now() - start_time).total_seconds()

            self.job_history.append(job_record)
            self.save_job_history()

        return job_record

    async def _execute_ingestion(self, csv_file: str) -> bool:
        """Execute data ingestion"""
        try:
            cmd = [
                sys.executable,
                'clickhouse-loader.py',
                csv_file
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=os.getcwd()
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                logger.info(f"Ingestion completed successfully for {csv_file}")
                if stdout:
                    logger.debug(f"Ingestion stdout: {stdout.decode()}")
                return True
            else:
                logger.error(f"Ingestion failed with return code {process.returncode}")
                if stderr:
                    logger.error(f"Ingestion stderr: {stderr.decode()}")
                return False

        except Exception as e:
            logger.error(f"Failed to execute ingestion: {e}")
            return False

    async def send_failure_notification(self, job_record: Dict):
        """Send failure notification"""
        message = f"Trade Map Data Pipeline Alert\n\nJob {job_record['job_id']} failed\nError: {job_record.get('error', 'Unknown error')}\nTime: {job_record.get('end_time', 'Unknown')}"

        # Email notification (if configured)
        if self.config.get('notification_email'):
            # This would need email library implementation
            logger.info(f"Would send email notification to {self.config['notification_email']}")

        # Slack notification (if configured)
        if self.config.get('slack_webhook'):
            # This would need HTTP client implementation
            logger.info("Would send Slack notification")

    async def run_cleanup_job(self):
        """Run data cleanup job"""
        logger.info("Running data cleanup job")

        try:
            # Remove old data files
            cutoff_date = datetime.now() - timedelta(days=self.config['retention_days'])

            for csv_file in self.data_dir.glob("*.csv"):
                if csv_file.stat().st_mtime < cutoff_date.timestamp():
                    csv_file.unlink()
                    logger.info(f"Removed old data file: {csv_file}")

            # Clean up old log files
            for log_file in self.logs_dir.glob("*.log"):
                if log_file.stat().st_mtime < cutoff_date.timestamp():
                    log_file.unlink()
                    logger.info(f"Removed old log file: {log_file}")

        except Exception as e:
            logger.error(f"Cleanup job failed: {e}")

    async def run_monitoring_job(self):
        """Run system monitoring job"""
        logger.info("Running monitoring job")

        try:
            # Check database connectivity
            # Check disk space
            # Check data freshness
            # Generate health report

            health_report = {
                'timestamp': datetime.now().isoformat(),
                'database_status': 'unknown',  # Would implement actual checks
                'disk_space': 'unknown',
                'last_extraction': 'unknown',
                'data_freshness_days': 0
            }

            # Save health report
            report_file = self.logs_dir / 'health_report.json'
            with open(report_file, 'w') as f:
                json.dump(health_report, f, indent=2)

            logger.info("Health monitoring completed")

        except Exception as e:
            logger.error(f"Monitoring job failed: {e}")

    async def schedule_loop(self):
        """Main scheduling loop"""
        logger.info("Starting Trade Map scheduler")
        logger.info(f"Extraction interval: {self.config['extraction_interval_hours']} hours")

        # Load job history
        self.load_job_history()

        # Run initial jobs
        await self.run_monitoring_job()
        await self.run_cleanup_job()

        last_extraction = datetime.now() - timedelta(hours=self.config['extraction_interval_hours'])
        last_cleanup = datetime.now()
        last_monitoring = datetime.now()

        while not self.shutdown_event.is_set():
            try:
                now = datetime.now()

                # Check if it's time for extraction
                if (now - last_extraction).total_seconds() >= self.config['extraction_interval_hours'] * 3600:
                    job_config = {
                        'job_type': 'daily_extraction',
                        'countries': ['United States', 'China', 'Germany', 'Japan', 'United Kingdom'],
                        'products': ['85', '84', '87'],  # Electronics, Machinery, Vehicles
                        'start_year': 2020,
                        'end_year': datetime.now().year
                    }

                    await self.run_extraction_job(job_config)
                    last_extraction = now

                # Check if it's time for cleanup (daily)
                if (now - last_cleanup).total_seconds() >= 24 * 3600:
                    await self.run_cleanup_job()
                    last_cleanup = now

                # Check if it's time for monitoring (hourly)
                if (now - last_monitoring).total_seconds() >= 3600:
                    await self.run_monitoring_job()
                    last_monitoring = now

                # Wait before next check
                await asyncio.sleep(60)  # Check every minute

            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
                await asyncio.sleep(60)

    async def run_once(self, job_type: str = 'extraction'):
        """Run a single job manually"""
        logger.info(f"Running {job_type} job once")

        if job_type == 'extraction':
            job_config = {
                'job_type': 'manual_extraction',
                'countries': ['United States', 'China', 'Germany'],
                'products': ['85', '84'],
                'start_year': 2023,
                'end_year': 2024
            }
            await self.run_extraction_job(job_config)

        elif job_type == 'ingestion':
            await self.run_ingestion_job({})

        elif job_type == 'cleanup':
            await self.run_cleanup_job()

        elif job_type == 'monitoring':
            await self.run_monitoring_job()

        logger.info(f"Manual {job_type} job completed")

    def get_status(self) -> Dict:
        """Get scheduler status"""
        return {
            'running_jobs': len(self.running_jobs),
            'total_jobs_history': len(self.job_history),
            'last_job': self.job_history[-1] if self.job_history else None,
            'config': self.config,
            'uptime': 'unknown'  # Would need to track start time
        }

def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Trade Map Data Scheduler')
    parser.add_argument('--run-once', choices=['extraction', 'ingestion', 'cleanup', 'monitoring'],
                       help='Run a single job and exit')
    parser.add_argument('--status', action='store_true', help='Show scheduler status')
    parser.add_argument('--config', action='store_true', help='Show configuration')

    args = parser.parse_args()

    scheduler = TradeMapScheduler()

    if args.config:
        print("Scheduler Configuration:")
        print(json.dumps(scheduler.config, indent=2))
        return

    if args.status:
        status = scheduler.get_status()
        print("Scheduler Status:")
        print(json.dumps(status, indent=2))
        return

    if args.run_once:
        asyncio.run(scheduler.run_once(args.run_once))
        return

    # Run scheduler continuously
    try:
        asyncio.run(scheduler.schedule_loop())
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")
    except Exception as e:
        logger.error(f"Scheduler failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
