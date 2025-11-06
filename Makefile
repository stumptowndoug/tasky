.PHONY: help install dev build mcp-build mcp-watch clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies (one-time setup)
	npm install
	npm run mcp:build
	@echo ''
	@echo '✅ Setup complete! Run "make dev" to start the app.'

dev: ## Start the development server
	npm run dev

build: ## Build the Next.js app for production
	npm run build

mcp-build: ## Build the MCP server
	npm run mcp:build

mcp-watch: ## Watch and rebuild MCP server on changes
	npm run mcp:watch

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules mcp-server/node_modules mcp-server/dist .next
	@echo '✅ Cleaned! Run "make install" to reinstall.'

.DEFAULT_GOAL := help
