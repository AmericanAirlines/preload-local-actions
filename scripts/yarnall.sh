# Run all the things to prepare for push to origin
# the same as is done in the test build workflow
yarn install --frozen-lockfile
yarn lint:fix
yarn pretty:fix
yarn build
yarn test

if [[ "$(git status --porcelain)" != "" ]]; then
    echo ----------------------------------------
    echo git status
    echo ----------------------------------------
    git status
    echo ----------------------------------------
    echo git diff
    echo ----------------------------------------
    git diff
    echo ----------------------------------------
    echo Troubleshooting
    echo ----------------------------------------
    echo "::error::Unstaged changes detected. Try running: git clean -ffdx && yarn install --frozen-lockfile && yarn lint:fix && yarn pretty:fix && yarn build && yarn test"
    exit 1
fi

