# Single entry point for common tasks. Run `make` for the list.

.DEFAULT_GOAL := help
.PHONY: help install start test fix verify infra-init infra-check infra-fmt deploy release open push-secrets

PORT ?= 8080

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  %-13s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install npm dependencies
	npm ci

start: ## Serve the app locally (PORT=8080)
	scripts/start.sh $(PORT)

test: ## Run Playwright E2E tests
	npm test

fix: ## Auto-fix ESLint and Prettier violations
	npm run lint:fix
	npm run format

verify: ## Run before every PR: lint, format, audit, tests
	npm run check
	npm test

infra-init: ## Init Terraform with the GCS backend
	cd infra && ../scripts/tf-local-init.sh

infra-check: ## TFLint, validate, fmt check, Checkov
	cd infra && ../scripts/check.sh

infra-fmt: ## Format Terraform files
	cd infra && terraform fmt -recursive

release: ## Normal deploy: tag and push, GitHub Actions deploys (TAG=v1.2.3)
	@test -n "$(TAG)" || { echo "Usage: make release TAG=v1.2.3"; exit 1; }
	git tag $(TAG) && git push origin $(TAG)

deploy: ## Manual fallback deploy from this machine, bypasses CI
	scripts/deploy.sh

open: ## Proxy the deployed app and open the browser (PORT=8080)
	scripts/open.sh $(PORT)

push-secrets: ## Push data/*.json to GCP Secret Manager
	scripts/push-data-secrets.sh
