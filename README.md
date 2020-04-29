<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Ephemeral helm chart installs

Use this action to install helm charts during the build which will be deleted in the post-step :rocket:
This is useful for temporary installs of databases, messaging systems and other infra required for integration-testing.

## Usage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    # install helm
    - uses: azure/setup-helm@v1
    # have a k8s cluster, normally you'd like to install on your rig
    - name: Create k8s Kind Cluster
      uses: helm/kind-action@v1.0.0-rc.1
      with:
        node_image: kindest/node:v1.17.2
    # install postgresql chart
    - id: postgresql
      uses: evryfs/helm-ephemeral-action@master
      with:
        repo: https://charts.bitnami.com/bitnami
        chart: postgresql
        helm: 'helm' # optional, default value is 'helm'
        args: '--wait --timeout 2m' #optional, default value is '--wait --timeout 2m' in order to wait for the chart-install to stabilize into ready state
    - name: Run build
      env:
        POSTGRESQL_ADDR: ${{ steps.postgresql.releaseName }}
      run: |
        # run some test which will use lookup the postgresql endpoint from env var POSTGRESQL_ADDR
        mvn -gs /settings-xml/settings.xml --fail-at-end -Dintegration-test=true -Dflyway=true -Denv=ci -Dbatch-test=true clean install surefire-report:report-only -Daggregate=true
```
