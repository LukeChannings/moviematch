# Plex Filters

## Query Strings

- `includeCollections` - whether to include film collections in results
- `includeMeta` - whether to include filtering / sorting metadata
- `includeExternalMedia` - ??
- `includeAdvanced` - ??

## Filter to Query String conversion

### Integer

| Name            | Operator | Query String  |
| --------------- | -------- | ------------- |
| is              | =        | `key=value`   |
| is not          | !=       | `key!=value`  |
| is greater than | >>=      | `key>>=value` |
| is less than    | <<=      | `key<<=value` |

### String

| Name             | Operator | Query String  |
| ---------------- | -------- | ------------- |
| contains         | =        | `key=value`   |
| does not contain | !=       | `key!=value`  |
| is               | ==       | `key==value`  |
| is not           | !==      | `key!==value` |
| begins with      | <=       | `key<=value`  |
| ends with        | >=       | `key>=value`  |

### Boolean

| Name     | Operator | Query String |
| -------- | -------- | ------------ |
| is true  | =        | `key=1`      |
| is false | !=       | `key!=1`     |

### Tag

| Name   | Operator | Query String |
| ------ | -------- | ------------ |
| is     | =        | `key=value`  |
| is not | !=       | `key!=value` |

### Date

| Name      | Operator | Query String  |
| --------- | -------- | ------------- |
| is before | <<=      | `key<<=value` |
| is before | >>=      | `key>>=value` |
