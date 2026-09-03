"""
Automated Git & GitHub Push Utility for FinCore.
Supports pushing to any GitHub remote repository using pure Python dulwich.
"""

import sys
import os
import dulwich.porcelain as git
from dulwich.repo import Repo

def push_repo(remote_url: str):
    repo_path = os.path.dirname(os.path.abspath(__file__))
    repo = Repo(repo_path)
    
    # 1. Stage and commit any latest changes
    git.add(repo_path)
    try:
        git.commit(repo_path, message=b"feat: update FinCore autonomous agent suite", author=b"FinCore Dev <dev@fincore.ai>")
        print("[Git] Committed latest changes.")
    except Exception as e:
        print(f"[Git] Working tree clean or up-to-date: {e}")

    # 2. Add or update remote
    config = repo.get_config()
    config.set((b"remote", b"origin"), b"url", remote_url.encode("utf-8"))
    config.write_to_path()
    print(f"[Git] Configured remote 'origin' -> {remote_url}")

    # 3. Push to main branch
    print(f"[Git] Pushing to {remote_url}...")
    try:
        git.push(repo_path, remote_url, refspecs=[b"refs/heads/master:refs/heads/main"])
        print("[Git] Successfully pushed master -> main!")
    except Exception:
        try:
            git.push(repo_path, remote_url, refspecs=[b"refs/heads/main:refs/heads/main"])
            print("[Git] Successfully pushed main -> main!")
        except Exception as err:
            print(f"[Git Error] Failed to push: {err}")
            return False
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python push_to_github.py <GITHUB_REPO_URL>")
        sys.exit(1)
    url = sys.argv[1].strip()
    push_repo(url)
