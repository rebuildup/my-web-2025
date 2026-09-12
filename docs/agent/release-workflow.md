# Release Sprint と GitHub運用

## Branch model

`main` はreleased state、sprintは `release-x-y-z`、top-level Issueのticket branchはIssue番号のみとする。sprint開始時に `main` からrelease branchを作る。release branchへ直接実装しない。

## Issue / Project

独立して計画・review・統合する仕事は日本語のGitHub Issueにする。Project columnsは `Backlog -> Ready -> In Progress -> In Review -> Done`。Priority、Size、Target Version、Area、Blocked/dependencyを設定し、実capacityを超えてWIPを増やさない。

## Ticket lifecycle

Issueを依存グラフへ分解し、ready nodeだけを並行実行する。最初の意味あるcommit後、ticket branchからtarget release branchへのDraft PRを作る。PR title/bodyとreview discussionは日本語。acceptance criteria、required gate、staleness、blocking reviewが解消され、target branchへmergeされてからIssueとProjectをDoneにする。

## Release lifecycle

release branch上の全ticketを統合後、release-wide gateを実行する。release PRは `release-x-y-z -> main` とし、goal、included Issue/PR、breaking changes、migration、validation、known limitationsを日本語で記載する。merge後の `main` がそのversionのreleased stateとなる。tag/release/deployはside-effect journalとremote確認を伴う。
