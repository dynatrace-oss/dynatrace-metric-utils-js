/*
Copyright 2021 Dynatrace LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Dimension } from "./metric";

const METRIC_KEY_MAX_LENGTH = 250;
const DIMENSION_KEY_MAX_LENGTH = 100;
const DIMENSION_VALUE_MAX_LENGTH = 250;

const RE_MK_FIRST_SECTION_INVALID_START_RANGE = /^[^a-z_]+/i;
const RE_MK_SECTION_INVALID_RANGE = /[^a-z0-9_-]+/ig;

const RE_DK_INVALID_SECTION_START_RANGE = /^[^a-z_]+/;
const RE_DK_INVALID_CHARACTER_RANGE = /[^a-z0-9_:-]+/g;

const RE_DV_NON_CONTROL_CHARACTERS_RANGE = /[\x00-\x1f]+/g;

const CHARS_TO_ESCAPE = new Set([
    "=",
    " ",
    ",",
    "\\",
    '"'
]);

export function normalizeMetricKey(name: string): string | null {
    const sections = name.slice(0, METRIC_KEY_MAX_LENGTH).split(".");
    const first = normalizeMetricKeyFirstSection(sections.shift()!);
    if (!first) {
        return null;
    }

    return [
        first,
        ...sections
            .map(normalizeMetricKeySection)
            .filter(Boolean)
    ].join(".");

}

export function normalizeDimensionKey(key: string): string | null {
    const normalizedSections = key
        .substr(0, DIMENSION_KEY_MAX_LENGTH)
        .split(".")
        .map(normalizeDimensionKeySection)
        .filter(s => s.length);

    return normalizedSections.length > 0 ? normalizedSections.join(".") : null;
}

export function normalizeDimensionValue(value: string): string {
    // in JS, we could receive an unexpected type
    value = String(value);
    value = value.slice(0, DIMENSION_VALUE_MAX_LENGTH);
    value = removeControlCharacters(value);
    value = escapeCharacters(value);
    value = value.slice(0, DIMENSION_VALUE_MAX_LENGTH);
    return ensureValidTrailingSlashes(value);
}

export function normalizeDimensions(dimensions: Dimension[]): Dimension[] {
    return dimensions.map(normalizeDimension).filter((d): d is Dimension => Boolean(d));
}

function normalizeDimension(dim: Dimension): Dimension | null {
    const key = normalizeDimensionKey(dim.key);
    if (!key) {
        return null;
    }

    const value = normalizeDimensionValue(dim.value);

    return { key, value };
}

function removeControlCharacters(s: string): string {
    s = s.replace(RE_DV_NON_CONTROL_CHARACTERS_RANGE, "_");
    return s;
}

function escapeCharacters(s: string): string {
    return s.split("").map(c => CHARS_TO_ESCAPE.has(c) ? `\\${c}` : c).join("");
}

function ensureValidTrailingSlashes(s: string): string {
    const trailingSlashesMatch = /\\+$/.exec(s);
    if (trailingSlashesMatch == null) {
        return s;
    }

    // An odd number of trailing slashes indicates an invalid escape sequence after trim
    // if there is an odd number of trailing slashes, trim the last one
    return trailingSlashesMatch[0].length % 2 === 0 ?
        s :
        s.slice(0, s.length - 1);
}

function normalizeMetricKeyFirstSection(section: string): string {
    // First section must start with a letter or underscore
    return normalizeMetricKeySection(section.replace(RE_MK_FIRST_SECTION_INVALID_START_RANGE, "_"));
}

function normalizeMetricKeySection(section: string): string {
    return section.replace(RE_MK_SECTION_INVALID_RANGE, "_");
}

function normalizeDimensionKeySection(section: string): string {
    section = section.toLocaleLowerCase();
    section = section.replace(RE_DK_INVALID_SECTION_START_RANGE, "_");
    section = section.replace(RE_DK_INVALID_CHARACTER_RANGE, "_");
    return section;
}

