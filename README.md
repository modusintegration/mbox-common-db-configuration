# Common db knex configuration for mbox projects

### How to publish a new version using github package manager

Follow the official [guideline](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages) provided by github, for publishing a new version of this library into the github package registry.


### Installing the library from other projects

If a project needs to install this library, the location of the npm registry needs to be updated for the @modusintegration organization, so it can retrieve it from the github package manager. A Github generated token is needed to download the package from the registry. More details about this process is also on the official [guideline](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages).

- Add or update the .npmrc file on the root folder of the project that is going to use the library, with the following information:
```
    //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
    @modusintegration:registry=https://npm.pkg.github.com
```

- Update the Dockerfile with :

```
    ARG GITHUB_PACKAGES_TOKEN

    COPY .npmrc .npmrc

    RUN npm install
    
    RUN rm -f .npmrc
```

- Create the GITHUB_PACKAGES_TOKEN environment variable, adding the token created on github as value. Token creation official guide is [here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

- For building a docker image for the project installing this library, the token should be set doing: 
    ```
     docker build --build-arg GITHUB_PACKAGES_TOKEN=changeme .
     ```

- For docker-compose use, you should add the args description inside the build tag related to the app installing the library. Example:

```
    build:
        context: ..
        dockerfile: Dockerfile
        args: 
            GITHUB_PACKAGES_TOKEN: changeme
```

- For locally running using npm start, the GITHUB_PACKAGES_TOKEN should be set as environment variable on your local machine



### Installing the library from other projects that build on CircleCi

- Update the `config.yml` file inside the `.circleci` folder adding the line:

```
    extra_build_args: "--build-arg GITHUB_PACKAGES_TOKEN=$GITHUB_PACKAGES_TOKEN"
```

- Add GITHUB_PACKAGES_TOKEN as environment variable on the project settings on CircleCi



