# GMF
# @author:echosoar
# @site: https://github.com/echosoar/autoGit
# @version: 0.0.1
# 
# The best way to use:
# curl -O https://raw.githubusercontent.com/echosoar/gmf/master/makefile

.PHONY: all ci ad ps npmbuild build up init initjs
.IGNORE: init

BUILDID = $(shell date +%Y/%m/%d-%H:%M:%S)
NOWBRANCH = $(shell git rev-parse --abbrev-ref HEAD)
NPMFILE = ./package.json
ECHOSOAR = "https://raw.githubusercontent.com/echosoar/"
CCONF = "$(ECHOSOAR)cconf/master/"

## init type
type = none

all:
	make up
	make ps

autoGit:
	@echo GMF by echosoar

# check can execute orders npm run build
npmbuild:
ifeq ("$(shell test -e $(NPMFILE) && echo exists)", "exists")
ifeq ($(shell grep -l scripts $(NPMFILE)), $(NPMFILE))
ifeq ($(shell grep -l build $(NPMFILE)), $(NPMFILE))
		@npm run build
endif
endif
endif

# git add
ad: autoGit npmbuild
	@git add --all

# git commit
ci: ad
	@git commit -m 'commit at $(BUILDID) by echosoar/gmf'

# git push
ps: ci
	@git push origin ${NOWBRANCH}

build: npmbuild

# init project command：make init type=js
# Please refer to https://github.com/echosoar/cconf for all type types currently supported
init: 
ifeq ($(type), none)
	@echo type is not input
else
ifeq ($(shell curl -s "$(CCONF)$(type)/.cconf"), exists)
	@echo init $(type) start...
	@for dirName in $(shell curl -s "$(CCONF)$(type)/.cconfDir");do\
		mkdir -p $$dirName;\
	done
	@for fileName in $(shell curl -s "$(CCONF)$(type)/.cconfFile");do\
		curl -s -o ./$$fileName $(CCONF)$(type)/$$fileName;\
	done
	@echo init $(type) complete!
else
	@echo type is not support
endif
endif

# update makefile
up:
	@curl -s -O $(ECHOSOAR)gmf/master/makefile
	@echo GMF is the latest version.