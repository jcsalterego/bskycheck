VERSION=$(shell jq -r .version ./src/manifest.json)
VERSION_TAG=$(shell jq -r .version ./src/manifest.json | sed -e 's/\./_/g')
ZIP=bskycheck-${VERSION_TAG}.zip

.PHONY: all
all: clean mkdir package
.PHONY: mkdir
mkdir:
	mkdir -p build
.PHONY: clean
clean:
	rm -rf build
.PHONY: package
package:
	mkdir -p build/
	rsync -av src/ build/src/
	cd build/src/ && ls -al
	cd build/src/ && sed -e 's/ DEV//g' manifest.json > manifest.json.1
	cd build/src/ && ls -al
	cd build/src/ && jq . manifest.json.1
	cd build/src/ && mv -v manifest.json.1 manifest.json
	cd build/src/ && zip -r ${ZIP} . && mv ${ZIP} ../
	find build/
.PHONY: tag
tag:
	git tag ${VERSION}
	git push --tags
