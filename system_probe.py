#!/usr/bin/env python3
"""System probe for Cosmos: CPU, RAM and GPU use as percentages.

Prints one JSON object: {"cpu": 12, "ram": 46, "gpus": [{"usage": 41}]}.
CPU and RAM come from /proc. GPU use comes from nvidia-smi when it is
installed, or from the amdgpu sysfs counter; with neither, "gpus" is empty.

With --projects it also asks the Workbench plugin (local.workbench), if it is
installed, for project names to show as moons. Only the names, bounded and
cleaned, are kept. Nothing is written anywhere.
"""
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

PROC = Path('/proc')
SYS_DRM = Path('/sys/class/drm')
WORKBENCH_PROBE = Path.home() / '.config' / 'omarchy' / 'plugins' / 'local.workbench' / 'probe.py'
MAX_PROJECTS = 12
NAME = re.compile(r'[^\w .+-]', re.UNICODE)


def clamp(v):
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v != v:
        return None
    return round(max(0.0, min(100.0, v)), 1)


def cpu_times(proc=PROC):
    fields = (proc / 'stat').read_text().splitlines()[0].split()[1:9]
    values = [int(x) for x in fields]
    idle = values[3] + (values[4] if len(values) > 4 else 0)
    return sum(values), idle


def cpu(proc=PROC, wait=0.2):
    total1, idle1 = cpu_times(proc)
    time.sleep(wait)
    total2, idle2 = cpu_times(proc)
    dt = total2 - total1
    return clamp(100.0 * (dt - (idle2 - idle1)) / dt) if dt > 0 else 0.0


def ram(proc=PROC):
    info = {}
    for line in (proc / 'meminfo').read_text().splitlines():
        key, _, rest = line.partition(':')
        parts = rest.split()
        if parts and parts[0].isdigit():
            info[key] = int(parts[0])
    total = info.get('MemTotal', 0)
    avail = info.get('MemAvailable', info.get('MemFree', 0))
    return clamp(100.0 * (total - avail) / total) if total > 0 else 0.0


def nvidia():
    if not shutil.which('nvidia-smi'):
        return []
    try:
        out = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu', '--format=csv,noheader,nounits'],
                             capture_output=True, text=True, timeout=3, check=False).stdout
    except (OSError, subprocess.SubprocessError):
        return []
    gpus = []
    for line in out.splitlines()[:8]:
        v = clamp(line.strip())
        if v is not None:
            gpus.append({'usage': v})
    return gpus


def amd(drm=SYS_DRM):
    gpus = []
    for path in sorted(drm.glob('card[0-9]*/device/gpu_busy_percent'))[:8]:
        try:
            v = clamp(path.read_text().strip())
        except OSError:
            continue
        if v is not None:
            gpus.append({'usage': v})
    return gpus


def projects(probe=WORKBENCH_PROBE):
    if not probe.is_file():
        return []
    try:
        out = subprocess.run([sys.executable, str(probe)], capture_output=True, text=True, cwd=str(probe.parent),
                             timeout=10, check=False).stdout
        data = json.loads(out[:4 * 1024 * 1024])
    except (OSError, subprocess.SubprocessError, ValueError):
        return []
    names = []
    for p in (data.get('projects') or [])[:MAX_PROJECTS] if isinstance(data, dict) else []:
        name = p.get('name') if isinstance(p, dict) else None
        if isinstance(name, str):
            name = NAME.sub('', name).strip()[:40]
            if name:
                names.append({'name': name})
    return names


def snapshot(with_projects=False):
    out = {'cpu': 0.0, 'ram': 0.0, 'gpus': []}
    try:
        out['cpu'] = cpu()
    except (OSError, ValueError, IndexError):
        pass
    try:
        out['ram'] = ram()
    except (OSError, ValueError):
        pass
    out['gpus'] = nvidia() or amd()
    if with_projects:
        out['projects'] = projects()
    return out


if __name__ == '__main__':
    print(json.dumps(snapshot('--projects' in sys.argv[1:])))
