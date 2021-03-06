/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, NgtscCompilerHost, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {TestFile} from '../../../src/ngtsc/file_system/testing';
import {BundleProgram, makeBundleProgram} from '../../src/packages/bundle_program';
import {EntryPointFormat, EntryPointJsonProperty} from '../../src/packages/entry_point';
import {EntryPointBundle} from '../../src/packages/entry_point_bundle';
import {NgccSourcesCompilerHost} from '../../src/packages/ngcc_compiler_host';

/**
 *
 * @param format The format of the bundle.
 * @param files The source files to include in the bundle.
 * @param dtsFiles The typings files to include the bundle.
 */
export function makeTestEntryPointBundle(
    formatProperty: EntryPointJsonProperty, format: EntryPointFormat, isCore: boolean,
    srcRootNames: AbsoluteFsPath[], dtsRootNames?: AbsoluteFsPath[]): EntryPointBundle {
  const src = makeTestBundleProgram(srcRootNames[0], isCore);
  const dts = dtsRootNames ? makeTestDtsBundleProgram(dtsRootNames[0], isCore) : null;
  const isFlatCore = isCore && src.r3SymbolsFile === null;
  return {formatProperty, format, rootDirs: [absoluteFrom('/')], src, dts, isCore, isFlatCore};
}

export function makeTestBundleProgram(
    path: AbsoluteFsPath, isCore: boolean = false): BundleProgram {
  const fs = getFileSystem();
  const options = {allowJs: true, checkJs: false};
  const entryPointPath = fs.dirname(path);
  const host = new NgccSourcesCompilerHost(fs, options, entryPointPath);
  return makeBundleProgram(fs, isCore, path, 'r3_symbols.js', options, host);
}

export function makeTestDtsBundleProgram(
    path: AbsoluteFsPath, isCore: boolean = false): BundleProgram {
  const fs = getFileSystem();
  const options = {};
  const host = new NgtscCompilerHost(fs, options);
  return makeBundleProgram(fs, isCore, path, 'r3_symbols.d.ts', options, host);
}

export function convertToDirectTsLibImport(filesystem: TestFile[]) {
  return filesystem.map(file => {
    const contents =
        file.contents
            .replace(
                `import * as tslib_1 from 'tslib';`,
                `import { __decorate, __metadata, __read, __values, __param, __extends, __assign } from 'tslib';`)
            .replace(/tslib_1\./g, '');
    return {...file, contents};
  });
}

export function getRootFiles(testFiles: TestFile[]): AbsoluteFsPath[] {
  return testFiles.filter(f => f.isRoot !== false).map(f => absoluteFrom(f.name));
}
