# Repository and branching guidelines

## Branches

1. `master` all new developments are merged on this branch, it is the main branch
2. `stage` pre-release branch environment
3. `release-*` for each new release there will be a release branch based on master. **The highest-number release-\* branch is assumed to be active & deployed**
4. `feature/*` development branch for a new feature (they are temporary and merged into master)
5. `hotfix/*` branch for fixing release bugs

## Examples

#### New development

1. A new feature branch is created from master: `feature/add_datalayer_swarm`
2. If the development takes some time and master has new code, rebase it (`master`->`feature/add_datalayer_swarm`)
3. Once the feature is finished it will be merged to master via MR (depending on the relevance of the feature fast-forward or merge-commit will be used)


#### Stage

When a new release needs to be created, the first step is the stage (pre-release) phase.
Stage will be based on `master` branch. Once testing and quality assurance has been completed, stage will be moved to `release-X.Y`


### Release creation

1. A new release branch is created from stage, such as release-0.1
2. The release branch will receive changes which are only required by the specific release and hotfixes
3. Once the release is ready to be published, a new tag is created: v0.1.0


### Release hotfix

1. If a relevant bug is found, a new hotfix branch is created, based on the last release: `hotfix/data_race_swarm`
2. Once the hotfix is done, it is merged to the release-0.1 branch. The hotfix might be cherry-picked from master
3. A new tag is created: v0.1.1
4. Meanwhile the master branch keeps being updated by its own

## Other considerations

Available branch name## Branches

1. `master` all new developments are merged on this branch, it is the main branch
2. `stage` pre-release branch environment
3. `release-*` for each new release there will be a release branch based on master
4. `feature/*` development branch for a new feature (they are temporary and merged into master)
5. `hotfix/*` branch for fixing release bugs

## Examples

#### New development

1. A new feature branch is created from master: `feature/add_datalayer_swarm`
2. If the development takes some time and master has new code, rebase it (`master`->`feature/add_datalayer_swarm`)
3. Once the feature is finished it will be merged to master via MR (depending on the relevance of the feature fast-forward or merge-commit will be used)


#### Stage

When a new release needs to be created, the first step is the stage (pre-release) phase.
Stage will be based on `master` branch. Once testing and quality assurance has been completed, stage will be moved to `release-X.Y`


### Release creation

1. A new release branch is created from stage, such as release-0.1
2. The release branch will receive changes which are only required by the specific release and hotfixes
3. Once the release is ready to be published, a new tag is created: v0.1.0


### Release hotfix

1. If a relevant bug is found, a new hotfix branch is created, based on the last release: `hotfix/data_race_swarm`
2. Once the hotfix is done, it is merged to the release-0.1 branch. The hotfix might be cherry-picked from master
3. A new tag is created: v0.1.1
4. Meanwhile the master branch keeps being updated by its own

## Other considerations

Available branch names are: **feature/<feature_name>** **bugfix/<bug_name>** **hotfix/<hotfix_name>** **refactor/<refactor_name>**

Make commits atomic. Usually 1 commit per modification (do not worry about creating multiple commits):

+ Wrong: 1)`add datalayer and other modifications`
+ Correct: 1)`add new datalayer swarm` 2)`swarm datalayer API integration` 3)`extend README with swarm datalayer information` 4)`add comments to swarm datalayer`

Use fast-forward for small merges such as 1 or 2 commits. Use merge-commit when merging features or bugfixes with several commits.

Exception: before merging if the commit history is messy or dirty, squash them and add a big commit listing all modifications.


----

[Similar model reference](https://nvie.com/posts/a-successful-git-branching-model/)

# Git snippets

#### Make modifications on a Merge Request

+ `git add <modified files>`
+ `git commit --amend`
+ `git push origin <branch_name> --force`

Make commits atomic. Usually 1 commit per modification (do not worry about creating multiple commits):

+ Wrong: 1)`add datalayer and other modifications`
+ Correct: 1)`add new datalayer swarm` 2)`swarm datalayer API integration` 3)`extend README with swarm datalayer information` 4)`add comments to swarm datalayer`

Use fast-forward for small merges such as 1 or 2 commits. Use merge-commit when merging features or bugfixes with more than 2 commits.

Exception: before merging if the commit history is messy or dirty, squash them and add a big commit listing all modifications.


----

[Similar model reference](https://nvie.com/posts/a-successful-git-branching-model/)

# Git snippets

#### Make modifications on a Merge Request

+ `git add <modified files>`
+ `git commit --amend`
+ `git push origin <branch_name> --force`