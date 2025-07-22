#!/usr/bin/env python3

import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

from . import env_global_name
from .exceptions import ConfigError, MissingEnv

configs: dict[str, dict[str, Any]] = {}
logger = logging.getLogger('Helpers')


@lru_cache(64)
def get_homedir() -> Path:
    if not os.environ.get(env_global_name):
        # Try to open a .env file in the home directory if it exists.
        if (Path(__file__).resolve().parents[2] / '.env').exists():
            with (Path(__file__).resolve().parents[2] / '.env').open() as f:
                for line in f:
                    key, value = line.strip().split('=', 1)
                    if value[0] in ['"', "'"]:
                        value = value[1:-1]
                    os.environ[key] = value

    if not os.environ.get(env_global_name):
        guessed_home = Path(__file__).resolve().parent.parent.parent
        raise MissingEnv(f"{env_global_name} is missing. \
Run the following command (assuming you run the code from the cloned repository):\
    export {env_global_name}='{guessed_home}'")
    homedir = Path(os.environ[env_global_name])
    if not homedir.exists():
        raise ConfigError(
            f"{env_global_name} points to a non-existing directory: {homedir}"
        )
    return homedir


@lru_cache(64)
def load_configs(path_to_config_files: str | Path | None=None) -> None:
    global configs
    if configs:
        return
    if path_to_config_files:
        if isinstance(path_to_config_files, str):
            config_path = Path(path_to_config_files)
        else:
            config_path = path_to_config_files
    else:
        config_path = get_homedir() / 'config'
    if not config_path.exists():
        raise ConfigError(
            f'Configuration directory {config_path} does not exists.'
        )
    if not config_path.is_dir():
        raise ConfigError(
            f'Configuration directory {config_path} is not a directory.'
        )

    configs = {}
    for path in config_path.glob('*.json'):
        with path.open() as _c:
            configs[path.stem] = json.load(_c)


@lru_cache(64)
def get_config(config_type: str, entry: str | None=None, quiet: bool=False) -> Any:
    """
    Get an entry from the given config_type file.
    Automatic fallback to the sample file
    """
    if not configs:
        load_configs()
    if config_type in configs:
        if entry:
            if entry in configs[config_type]:
                return configs[config_type][entry]
            if not quiet:
                logger.warning(f'Unable to find {entry} in config file.')
        else:
            return configs[config_type]
    else:
        if not quiet:
            logger.warning(f'No {config_type} config file available.')
    if not quiet:
        logger.warning(f'Falling back on sample config, please initialize the {config_type} config file.')
    with (get_homedir() / 'config' / f'{config_type}.json.sample').open() as _c:
        sample_config = json.load(_c)
    if entry:
        return sample_config[entry]
    return sample_config
