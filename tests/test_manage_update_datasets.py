"""What `manage update-datasets` refreshes, and what `manage update` leaves alone.

Refreshing the MISP datasets to upstream HEAD used to be an HTTP request
shelling out to git against the deployment's own checkout. It is an operator
command now, and deliberately a separate one: `update` checks out the pinned
submodule pointers so two operators updating a week apart land on the same tag
set, and only `update-datasets` moves those pointers.
"""

import pytest

from bin import manage

DATASETS = ["submodules/misp-taxonomies", "submodules/misp-galaxy"]


class _Refresh:
    """The commands the refresh ran, over a fake git that reports SHAs.

    Each path's list is read twice - once before the update, once after - so a
    pair of identical SHAs is a submodule that did not move.
    """

    def __init__(self):
        self.commands = []
        self.shas = {path: ["aaaaaaa", "aaaaaaa"] for path in DATASETS}

    def moves(self, path, before, after):
        self.shas[path] = [before, after]


@pytest.fixture
def refresh(monkeypatch):
    recorder = _Refresh()
    monkeypatch.setattr(
        manage, "run", lambda cmd, cwd=None, check=True: recorder.commands.append(cmd)
    )
    monkeypatch.setattr(manage, "_submodule_sha", lambda path: recorder.shas[path].pop(0))
    return recorder


def test_update_datasets_refreshes_the_dataset_submodules_only(refresh):
    """pivotick is a pinned library, not a dataset - it stays where it is."""
    manage.cmd_update_datasets()

    assert refresh.commands == [
        ["git", "submodule", "update", "--remote",
         "submodules/misp-taxonomies", "submodules/misp-galaxy"]
    ]


def test_a_moved_submodule_reports_both_shas_and_asks_for_a_commit(refresh, capsys):
    """`--remote` leaves the new pointer uncommitted; `update` would revert it."""
    refresh.moves("submodules/misp-galaxy", "aaaaaaa", "bbbbbbb")

    manage.cmd_update_datasets()

    out = capsys.readouterr().out
    assert "aaaaaaa" in out
    assert "bbbbbbb" in out
    assert "git commit" in out


def test_nothing_moved_says_so_and_does_not_ask_for_a_commit(refresh, capsys):
    manage.cmd_update_datasets()

    out = capsys.readouterr().out
    assert "already current" in out
    assert "git commit" not in out


def test_a_submodule_that_was_never_checked_out_fails_the_refresh(refresh, capsys):
    """`git submodule update --remote` prints 'not initialized' and still exits
    0, so a clone made without --recurse-submodules has to be caught here."""
    refresh.shas["submodules/misp-galaxy"] = ["?", "?"]

    with pytest.raises(SystemExit) as failure:
        manage.cmd_update_datasets()

    assert failure.value.code != 0
    out = capsys.readouterr()
    assert "not initialised" in out.out + out.err
    assert "manage init" in out.out


def test_update_checks_out_the_pinned_pointers(monkeypatch):
    """`update` carrying `--remote` would silently advance the datasets on every
    run, so a refresh survives it only once the new pointers are committed."""
    commands = []
    monkeypatch.setattr(manage, "run", lambda cmd, cwd=None, check=True: commands.append(cmd))
    monkeypatch.setattr(manage, "_run_db_upgrade", lambda: None)

    manage.cmd_update()

    assert ["git", "submodule", "update", "--init", "--recursive"] in commands
    assert not any("--remote" in cmd for cmd in commands)
