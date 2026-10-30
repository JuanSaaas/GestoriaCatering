from contextlib import contextmanager
import os


class ReaderAlreadyRunning(Exception):
    pass


@contextmanager
def reader_lock(directory):
    """One local reader per input folder; OS releases the lock on process exit."""
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / '.lector.lock').open('a+b') as handle:
        if handle.seek(0, 2) == 0:
            handle.write(b'0')
            handle.flush()
        handle.seek(0)
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            raise ReaderAlreadyRunning('El lector ya esta ejecutandose para esta carpeta.') from exc
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == 'nt':
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
