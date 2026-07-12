import json
import sys


def solve(payload: dict):
    matrix = payload.get("matrix", [])
    if not matrix:
        return []
    try:
        from scipy.optimize import linear_sum_assignment
        import numpy as np
        arr = np.array(matrix, dtype=float)
        row_ind, col_ind = linear_sum_assignment(arr)
        return [{"tripIndex": int(r), "pairIndex": int(c), "cost": float(arr[r][c])} for r, c in zip(row_ind, col_ind)]
    except Exception:
        used = set()
        out = []
        for r, row in enumerate(matrix):
          best_c = None
          best_v = None
          for c, val in enumerate(row):
            if c in used:
              continue
            if best_v is None or val < best_v:
              best_v = val
              best_c = c
          if best_c is not None:
            used.add(best_c)
            out.append({"tripIndex": r, "pairIndex": best_c, "cost": best_v})
        return out


if __name__ == "__main__":
    payload = json.loads(sys.stdin.read())
    sys.stdout.write(json.dumps(solve(payload)))
