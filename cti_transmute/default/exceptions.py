#!/usr/bin/env python3


class TransmuteException(Exception):
    pass


class ConfigError(TransmuteException):
    pass


class MissingEnv(TransmuteException):
    pass
