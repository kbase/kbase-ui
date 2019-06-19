---
title: Recipes
parent: testing
grand_parent: master
nav_order: 4
---

# Test Recipes

## Unit Testing

```bash
make unit-tests
```

## Integration Testing

```bash
make integration-tests host=HOST
```

where HOST is one of ci, next, appdev, narrative.

> TODO: instead of host, use env, and have the host looked up in the deploy configs.

> TODO: better yet, have an uber-integration test which reads all the configs, and runs the tests for each environment.
