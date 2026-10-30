from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from automation.facturas.reader_lock import reader_lock, ReaderAlreadyRunning


class ReaderLockTests(unittest.TestCase):
    def test_another_reader_cannot_run_for_the_same_folder(self):
        with TemporaryDirectory() as folder:
            directory = Path(folder) / 'entrada'
            with reader_lock(directory):
                with self.assertRaises(ReaderAlreadyRunning):
                    with reader_lock(directory):
                        self.fail('A second reader acquired the lock')
            with reader_lock(directory):
                self.assertTrue(directory.is_dir())

    def test_lock_is_released_after_a_reader_error(self):
        with TemporaryDirectory() as folder:
            directory = Path(folder)
            with self.assertRaises(RuntimeError):
                with reader_lock(directory):
                    raise RuntimeError('simulated reader failure')
            with reader_lock(directory):
                pass
