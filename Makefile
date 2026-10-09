# Single entry point for common tasks. Run `make` or `make help` for the list.

.DEFAULT_GOAL := help
SHELL := /usr/bin/env bash

PORT ?= 8080
TAG  ?=

.PHONY: help install start test test-ui lint lint-fix format format-check audit check ci \
        infra-init infra-check infra-fmt deploy open push-secrets tag

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

##@ Setup
install: ## Install npm dependencies (reproducible)
	npm ci

##@ Develop
start: ## Serve the app locally and open the browser (PORT=8080)
	scripts/start.sh $(PORT)

test: ## Run all Playwright E2E tests
	npm test

test-ui: ## Run Playwright in interactive UI mode
	npm run test:ui

##@ Quality
lint: ## ESLint
	npm run lint

lint-fix: ## ESLint with auto-fix
	npm run lint:fix

format: ## Prettier write
	npm run format

format-check: ## Prettier check
	npm run format:check

audit: ## npm audit (moderate and above)
	npm run audit

check: ## Lint + format check + audit
	npm run check

ci: check test ## Everything CI runs for the app: check + test

##@ Infrastructure (Terraform)
infra-init: ## Init Terraform with the GCS backend
	cd infra && ../scripts/tf-local-init.sh

infra-check: ## TFLint, validate, fmt check, Checkov
	cd infra && ../scripts/check.sh

infra-fmt: ## Format Terraform files
	cd infra && terraform fmt -recursive

##@ Deploy
deploy: ## Build image, push to Artifact Registry, deploy to Cloud Run
	scripts/deploy.sh

tag: ## Tag and push a release, which triggers the deploy workflow (TAG=v1.2.3)
	@test -n "$(TAG)" || { echo "Usage: make tag TAG=v1.2.3"; exit 1; }
	git tag $(TAG) && git push origin $(TAG)

open: ## Proxy the deployed app and open the browser (PORT=8080)
	scripts/open.sh $(PORT)

push-secrets: ## Push data/*.json to GCP Secret Manager
	scripts/push-data-secrets.sh
