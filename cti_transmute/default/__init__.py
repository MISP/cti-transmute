import os

from .exceptions import ConfigError, MissingEnv
from .helpers import get_config, get_homedir, load_configs

env_global_name: str = 'TRANSMUTE_HOME'

os.chdir(get_homedir())

__all__ = [
    'ConfigError',
    'get_config',
    'get_homedir',
    'load_configs',
    'MissingEnv'
]
