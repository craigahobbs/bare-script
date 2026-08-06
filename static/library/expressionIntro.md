Welcome to the [BareScript](https://craigahobbs.github.io/bare-script/language/) Expression Library
documentation. The expression library is the set of spreadsheet-like functions available when
evaluating standalone
[BareScript expressions](https://craigahobbs.github.io/bare-script/language/#expressions) — for
example, with the implementations' expression APIs (JavaScript `evaluateExpression`, Python
`evaluate_expression`) or the `barescriptEvaluateExpression` builtin.

Each expression function is a short alias of a builtin library function:

| Expression | Builtin |
| ---------- | ------- |
| `abs` | `mathAbs` |
| `acos` | `mathAcos` |
| `arrayNew` | `arrayNew` |
| `asin` | `mathAsin` |
| `atan` | `mathAtan` |
| `atan2` | `mathAtan2` |
| `ceil` | `mathCeil` |
| `charCodeAt` | `stringCharCodeAt` |
| `cos` | `mathCos` |
| `date` | `datetimeNew` |
| `day` | `datetimeDay` |
| `endsWith` | `stringEndsWith` |
| `fixed` | `numberToFixed` |
| `floor` | `mathFloor` |
| `fromCharCode` | `stringFromCharCode` |
| `hour` | `datetimeHour` |
| `indexOf` | `stringIndexOf` |
| `lastIndexOf` | `stringLastIndexOf` |
| `len` | `stringLength` |
| `ln` | `mathLn` |
| `log` | `mathLog` |
| `lower` | `stringLower` |
| `max` | `mathMax` |
| `min` | `mathMin` |
| `minute` | `datetimeMinute` |
| `month` | `datetimeMonth` |
| `now` | `datetimeNow` |
| `objectNew` | `objectNew` |
| `parseFloat` | `numberParseFloat` |
| `parseInt` | `numberParseInt` |
| `pi` | `mathPi` |
| `rand` | `mathRandom` |
| `replace` | `stringReplace` |
| `rept` | `stringRepeat` |
| `round` | `mathRound` |
| `second` | `datetimeSecond` |
| `sign` | `mathSign` |
| `sin` | `mathSin` |
| `slice` | `stringSlice` |
| `sqrt` | `mathSqrt` |
| `startsWith` | `stringStartsWith` |
| `tan` | `mathTan` |
| `text` | `stringNew` |
| `today` | `datetimeToday` |
| `trim` | `stringTrim` |
| `upper` | `stringUpper` |
| `year` | `datetimeYear` |

See [The BareScript Library](index.html) for the full builtin function documentation.
