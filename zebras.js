const fs = require("fs")
const R = require("ramda")
const Table = require("cli-table3")

const isNumeric = require("./src/internal/isNumeric")

/**
 * Data manipulation and analysis library written in JavaScript
 * offering the convenience of pandas or R.
 * @namespace Z
 */

/**
 * Synchronously reads a CSV file.
 *
 * @func
 * @memberOf Z
 * @category IO
 * @param {String} filepath File path for the CSV file to read
 * @return {df} Zebras dataframe
 * @example
 *
 * Z.readCSV(filepath)
 */
const readCSV = R.curry(filepath => {
  const data = fs.readFileSync(filepath).toString("utf8")
  const dataProcessed = R.pipe(
    R.split("\n"),
    R.map(R.split(",")),
    R.reject(x => x.length === 1 && x[0] === "")
  )(data)
  const headers = R.flatten(R.take(1)(dataProcessed))
  const rows = R.tail(dataProcessed)
  const df = R.map(r => R.zipObj(headers)(r), rows)
  return df
})

/**
 * Synchronously writes a dataframe to a CSV file.
 *
 * @func
 * @memberOf Z
 * @category IO
 * @param {df} df Zebras dataframe to write
 * @param {String} filepath File path for the CSV file to write
 * @return {undefined}
 * @example
 *
 * Z.toCSV(filepath, df)
 */
const toCSV = R.curry((filepath, df) => {
  const headers = R.join(",", R.keys(R.nth(0, df)))
  const rows = R.map(R.values, df)
  const rowStrings = R.join("\n", R.map(R.join(","), rows))
  fs.writeFileSync(filepath, `${headers}\n${rowStrings}`)
})

/**
 * Prints dataframe.
 *
 * Returns the entire dataframe as an ASCII table.
 * If working in a local Node environment, wrap this and other printing
 * functions in `console.log()` to display ASCII tables.
 *
 * @func
 * @memberOf Z
 * @category IO
 * @param {df} dataframe to print
 * @return {String} Entire dataframe as an ASCII table
 * @example
 *
 * Z.print(df)
 *
 * // will output an ASCII table like this:
 * ┌────────────┬───────┬───────┬───────┬───────┬───────────┬─────────┐
 * │ Date       │ Open  │ High  │ Low   │ Close │ Adj Close │ Volume  │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-03 │ 16.66 │ 16.66 │ 16.66 │ 16.66 │ 16.66     │ 1260000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-04 │ 16.85 │ 16.85 │ 16.85 │ 16.85 │ 16.85     │ 1890000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-05 │ 16.93 │ 16.93 │ 16.93 │ 16.93 │ 16.93     │ 2550000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-06 │ 16.98 │ 16.98 │ 16.98 │ 16.98 │ 16.98     │ 2010000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-09 │ 17.08 │ 17.08 │ 17.08 │ 17.08 │ 17.08     │ 2520000 │
 * └────────────┴───────┴───────┴───────┴───────┴───────────┴─────────┘
 *
 */
const print = R.curry(df => {
  const headers = R.keys(df[0])
  const rows = R.map(R.values, df)
  const printTable = new Table({
    head: headers,
  })
  printTable.push(...rows)
  return `\n${printTable.toString()}`
})

/**
 * Print first n rows of dataframe.
 *
 * @func
 * @memberOf Z
 * @category IO
 * @param {Number} n Number of rows to print
 * @param {df} dataframe
 * @return {String} First `n` rows of dataframe as an ASCII table
 * @see Z.print, Z.printTail
 * @example
 *
 * Z.printHead(3, df)
 *
 * // will output an ASCII table like this:
 * ┌────────────┬───────┬───────┬───────┬───────┬───────────┬─────────┐
 * │ Date       │ Open  │ High  │ Low   │ Close │ Adj Close │ Volume  │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-05 │ 16.93 │ 16.93 │ 16.93 │ 16.93 │ 16.93     │ 2550000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-06 │ 16.98 │ 16.98 │ 16.98 │ 16.98 │ 16.98     │ 2010000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-09 │ 17.08 │ 17.08 │ 17.08 │ 17.08 │ 17.08     │ 2520000 │
 * └────────────┴───────┴───────┴───────┴───────┴───────────┴─────────┘
 *
 */
const printHead = (n, df) => {
  const truncated = R.take(n, df)
  return print(truncated)
}

/**
 * Print last n rows of dataframe.
 *
 * @func
 * @memberOf Z
 * @category IO
 * @param {Number} n Number of rows to print
 * @param {df} dataframe
 * @return {String} Last `n` rows of dataframe as an ASCII table
 * @see Z.print, Z.printHead
 * @example
 *
 * Z.printTail(3, df)
 *
 * // will output an ASCII table like this:
 * ┌────────────┬───────┬───────┬───────┬───────┬───────────┬─────────┐
 * │ Date       │ Open  │ High  │ Low   │ Close │ Adj Close │ Volume  │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-05 │ 16.93 │ 16.93 │ 16.93 │ 16.93 │ 16.93     │ 2550000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-06 │ 16.98 │ 16.98 │ 16.98 │ 16.98 │ 16.98     │ 2010000 │
 * ├────────────┼───────┼───────┼───────┼───────┼───────────┼─────────┤
 * │ 1950-01-09 │ 17.08 │ 17.08 │ 17.08 │ 17.08 │ 17.08     │ 2520000 │
 * └────────────┴───────┴───────┴───────┴───────┴───────────┴─────────┘
 *
 */
const printTail = (n, df) => {
  const truncated = R.takeLast(n, df)
  return print(truncated)
}

/**
 * Return dataframe with first n rows of input dataframe.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Number} n Number of rows to select from start of df
 * @param {df} dataframe
 * @return {df} Zebras dataframe
 * @see Z.slice, Z.tail
 * @example
 *
 * Z.head(3, df)
 * // returns a new dataframe with the first 3 lines of `df`
 *
 */
const head = (n, df) => {
  const truncated = R.take(n, df)
  return truncated
}

/**
 * Return a dataframe with the last n rows of input dataframe.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Number} n Number of rows to select from bottom of df
 * @param {df} dataframe
 * @return {df} Zebras dataframe
 * @see Z.slice, z.head
 * @example
 *
 * Z.tail(3, df)
 * // returns a new dataframe with the last 3 lines of `df`
 *
 */
const tail = (n, df) => {
  const truncated = R.takeLast(n, df)
  return truncated
}

/**
 * Filter dataframe rows by using a filtering function.
 *
 * Accepts a test function that determines which rows of the supplied
 * dataframe are returned.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Function} func A filtering function
 * @param {df} dataframe Zebras dataframe to filter
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 2}, {"label": "B", "value": 10}, {"label": "C", "value": 30}]
 * Z.filter(r => r.value >= 10, df)
 * // [{"label": "B", "value": 10}, {"label": "C", "value": 30}]
 */
const filter = R.curry((func, df) => R.filter(func, df))

/**
 * Sort dataframe rows using custom sorting function.
 *
 * Accepts a sorting function that determines the order of rows in the returned
 * dataframe.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Function} func A sorting function
 * @param {df} dataframe Zebras dataframe to sort
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.sort((a, b) => b.value - a.value, df)
 * // [{ label: "C", value: 75 },{ label: "A", value: 7 },{ label: "B", value: 2 }]
 */
const sort = R.curry((func, df) => R.sort(func, df))

/**
 * Sort dataframe rows by a column.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {String} col Name of the column to sort by
 * @param {String} direction Determines direction, pass `asc` for ascending and `desc` for descending
 * @param {df} dataframe Zebras dataframe to sort
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.sortByCol("value", "asc", df)
 * // [{"label": "B", "value": 2}, {"label": "A", "value": 7}, {"label": "C", "value": 75}]
 */
const sortByCol = R.curry((col, direction, df) =>
  R.sort(
    (a, b) => (direction === "asc" ? a[col] - b[col] : b[col] - a[col]),
    df
  )
)

/**
 * Convert columns to numerical type (floats).
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Array} columnNames Array of column names to convert
 * @param {df} dataframe Zebras dataframe to parse
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": "7"}, {"label": "B", "value": "2"}, {"label": "C", "value": "75"}]
 * Z.parseNums(["value"], df)
 * // [{"label": "B", "value": 2}, {"label": "A", "value": 7}, {"label": "C", "value": 75}]
 */
const parseNums = R.curry((cols, df) => {
  const convertRow = r => {
    const converter = (value, key) => {
      if (R.includes(key, cols)) return parseFloat(value)
      return value
    }
    return R.mapObjIndexed(converter, r)
  }
  return R.map(convertRow, df)
})

/**
 * Convert columns to datestamp.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Array} cols Array of column names to convert
 * @param {df} dataframe Zebras dataframe to parse
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": "2010-12-13"}, {"label": "B", "value": "2010-12-15"}, {"label": "C", "value": "2010-12-17"}]
 * Z.parseDates(["value"], df)
 * // [{"label": "A", "value": 1292198400000}, {"label": "B", "value": 1292371200000}, {"label": "C", "value": 1292544000000}]
 */
const parseDates = R.curry((cols, df) => {
  const convertRow = r => {
    const converter = (value, key) => {
      if (R.includes(key, cols)) return Date.parse(value)
      return value
    }
    return R.mapObjIndexed(converter, r)
  }
  return R.map(convertRow, df)
})

/**
 * Select a subset of columns.
 *
 * Accepts an array with the names of the columns to retain.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Array} cols Array of column names to pick
 * @param {df} dataframe Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.pickCols(["value"], df)
 * // [{"value": 7}, {"value": 2}, {"value": 75}]
 */
const pickCols = R.curry((cols, df) => R.map(R.pick(cols), df))

/**
 * Delete a column.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {String} col Name of the column to delete
 * @param {df} dataframe Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.dropCol("label", df)
 * // [{"value": 7}, {"value": 2}, {"value": 75}]
 */
const dropCol = R.curry((col, df) => R.map(R.dissoc(col), df))

/**
 * Extract a series to an array from a dataframe.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Name of the column to extract
 * @param {df} dataframe Zebras dataframe
 * @return {Array} Series array
 * @example
 *
 * const df = [{"label": "A", "value": "2010-12-13"}, {"label": "B", "value": "2010-12-15"}, {"label": "C", "value": "2010-12-17"}]
 * Z.getCol("value", df)
 * // ["2010-12-13", "2010-12-15", "2010-12-17"]
 */
const getCol = R.curry((col, df) => R.map(R.prop(col), df))

/**
 * Mean of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate mean for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.mean(series)
 * // 34
 */
const mean = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.mean(filteredArr)
})

/**
 * Median of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate median for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.median(series)
 * // 30
 */
const median = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.median(filteredArr)
})

/**
 * Standard deviation of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate standard deviation for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.std(series)
 * // 31.36080356113344
 */
const std = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  const sampleMean = R.mean(filteredArr)
  const n = R.length(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsSquared = R.map(x => x ** 2, diffs)
  const summed = R.sum(diffsSquared)
  return Math.sqrt(R.divide(summed, R.subtract(n, 1)))
})

/**
 * Skew of a series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate skew for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.skew(series)
 * // 0.17542841315728933
 */
const skew = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  const sampleStd = std(filteredArr)
  const stdCubed = sampleStd ** 3
  const sampleMean = R.mean(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsCubed = R.map(x => x ** 3, diffs)
  const summed = R.sum(diffsCubed)
  const n = R.length(filteredArr)
  return summed / n / stdCubed
})

/**
 * Kurtosis of a series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate kurtosis for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.kurt(series)
 * // -2.040541067936147
 */
const kurt = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  const sampleStd = std(filteredArr)
  const stdFourth = sampleStd ** 4
  const sampleMean = R.mean(filteredArr)
  const diffs = R.map(x => x - sampleMean, filteredArr)
  const diffsFourth = R.map(x => x ** 4, diffs)
  const summed = R.sum(diffsFourth)
  const n = R.length(filteredArr)
  return summed / n / stdFourth - 3
})

/**
 * Percent changes
 *
 * Returns a new series with the percent changes between the values
 * in order of the input series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate percent changes for
 * @return {Array}
 * @example
 *
 * const series = [10, 15, 20, 25, 50, 55]
 * Z.pctChange(series)
 * // [NaN, 0.5, 0.33333333333333326, 0.25, 1, 0.10000000000000009]
 */
const pctChange = R.curry(arr => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i === 0) return NaN
    return arr[i] / arr[i - 1] - 1
  }, iRange)
  return result
})

/**
 * Correlation between two series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} series1 First series
 * @param {Array} series2 Second series
 * @return {Number}
 * @example
 *
 * const series1 = [10, 15, 20, 25, 50, 55]
 * const series2 = [12, 18, 34, 52, 71, 86]
 * Z.corr(series1, series2)
 * // 0.969035563335365
 */
const corr = R.curry((arr1, arr2) => {
  if (R.length(arr1) !== R.length(arr2)) return "Arrays are not the same length"

  const sampleMean1 = R.mean(arr1)
  const sampleMean2 = R.mean(arr2)
  const std1 = std(arr1)
  const std2 = std(arr2)
  const nMinusOne = R.subtract(R.length(arr1), 1)
  const rangeArray = R.range(0, R.length(arr1))
  const products = R.map(
    x => (arr1[x] - sampleMean1) * (arr2[x] - sampleMean2),
    rangeArray
  )
  const summedProducts = R.sum(products)
  return summedProducts / (nMinusOne * std1 * std2)
})

/**
 * Pipe functions together by performing left-to-right function composition.
 *
 * @func
 * @memberOf Z
 * @category Composition
 * @param {Array} functions Array of functions to compose
 * @param {df} dataframe Zebras dataframe
 * @return {any} Result of the composed functions applied to dataframe
 * @example
 *
 * const data = [
 *   {"Date": "1997-01-01", "Value": "12"},
 *   {"Date": "1997-01-02", "Value": "14"},
 *   {"Date": "1997-01-03", "Value": "7"},
 *   {"Date": "1997-01-04", "Value": "112"}
 * ]
 * Z.pipe([
 *   Z.parseNums(["Value"]), // converts "Value" column to floats
 *   Z.getCol("Value"), // extracts "Value" column to array
 *   Z.mean() // calculates mean of "Value" array
 * ])(data)
 * // 36.25
 */
const pipe = R.curry((funcs, df) => R.pipe(...funcs)(df))

/**
 * Concatenate two dataframes.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {df} dataframe1 Zebras dataframe
 * @param {df} dataframe2 Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df1 = [{"label": "A", "value": 7}, {"label": "B", "value": 2}]
 * const df2 = [{"label": "C", "value": 17}, {"label": "D", "value": 2}]
 * Z.concat(df1, df2)
 * // [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 17}, {"label": "D", "value": 2}]
 */
const concat = R.curry((df1, df2) => R.concat(df1, df2))

/**
 * Create an object grouped by according to the supplied function.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Function} func Function returning string key
 * @param {df} dataframe Zebras dataframe
 * @return {Object}
 * @example
 *
 * const df = [{"Day": "Monday", "value": 10}, {"Day": "Tuesday", "value": 5}, {"Day": "Monday", "value": 7}]
 * Z.groupBy(x => x.Day, df)
 * // {"Monday": [{"Day": "Monday", "value": 10}, {"Day": "Monday", "value": 7}], "Tuesday": [{"Day": "Tuesday", "value": 5}]}
 */
const groupBy = R.curry((func, df) => R.groupBy(func, df))

/**
 * Get dataframe rows by index.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Number} start The start index (inclusive).
 * @param {Number} end The end index (exclusive).
 * @param {df} dataframe Zebras dataframe
 * @return {df} Zebras dataframe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * Z.slice(1, 2, df)
 * // [{"label": "B", "value": 2}]
 */
const slice = R.curry((start, end, df) => R.slice(start, end, df))

/**
 * Get unique values in a series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Array}
 * @example
 *
 * const series = [7, 7, 2, 30, 30, 56, 75]
 * Z.unique(series)
 * // [7, 2, 30, 56, 75]
 */
const unique = R.curry(arr => R.uniq(arr))

/**
 * Sum of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.sum(series)
 * // 170
 */
const sum = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.sum(filteredArr)
})

/**
 * Product of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.prod(series)
 * // 1764000
 */
const prod = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.product(filteredArr)
})

/**
 * Min of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.min(series)
 * // 2
 */
const min = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.apply(Math.min, filteredArr)
})

/**
 * Max of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.max(series)
 * // 75
 */
const max = R.curry(arr => {
  const filteredArr = R.filter(isNumeric, arr)
  return R.apply(Math.max, filteredArr)
})

/**
 * Range of series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Array} Array with min and max
 * @example
 *
 * const series = [7, 2, 30, 56, 75]
 * Z.getRange(series)
 * // [2, 75]
 */
const getRange = R.curry(arr => [min(arr), max(arr)])

/**
 * Count number of unique values in a series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.countUnique(series)
 * // 5
 */
const countUnique = R.curry(arr => R.length(R.uniq(arr)))

/**
 * Count number of occurences of each value in a series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Array of values
 * @return {Object}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.valueCounts(series)
 * // {"2": 1, "30": 2, "56": 1, "7": 1, "75": 1}
 */
const valueCounts = R.curry(arr => R.countBy(R.identity, arr))

/**
 * Add a new column to a dataframe from an array.
 *
 * Use this function to add an array as a new column in a dataframe.
 * Make sure the array has the same length as the number of rows in the dataframe.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {String} col Name of the column do add
 * @param {Array} arr Array of values for the new column
 * @param {df} dataframe Zebras dataframe to add the new column to
 * @return {df}
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "B", "value": 2}]
 * const series = ["2010-12-15", "2010-12-16"]
 * Z.addCol("date", series, df)
 * // [{"date": "2010-12-15", "label": "A", "value": 7}, {"date": "2010-12-16", "label": "B", "value": 2}]
 */
const addCol = R.curry((col, arr, df) => {
  if (!R.equals(R.length(df), R.length(arr)))
    return "Arrays are not of equal length"
  return df.map((row, i) => R.assoc(col, arr[i], row))
})

/**
 * Create a new array based on columns from existing dataframe.
 *
 * Use to create new columns derived from existing columns in a dataframe.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {Function} func Function to create the new column
 * @param {df} dataframe Zebras dataframe to add the new column to
 * @return {Array}
 * @example
 *
 * const temps = [{"date": "1990-05-06", "tempCelsius": 0}, {"date": "1990-05-07", "tempCelsius": 4}]
 * const fahrenheit = Z.deriveCol((r) => r.tempCelsius * 1.8 + 32, temps)
 * Z.addCol("tempFahrenheit", fahrenheit, temps)
 * // [{"date": "1990-05-06", "tempCelsius": 0, "tempFahrenheit": 32}, {"date": "1990-05-07", "tempCelsius": 4, "tempFahrenheit": 39.2}]
 */
const deriveCol = R.curry((func, df) => R.map(func, df))

/**
 * Returns a new series with the differences between the values in the order of
 * the input series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Array} arr Series to calculate differences for
 * @return {Array}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.diff(series)
 * // [NaN, -5, 28, 0, 26, 19]
 */
const diff = R.curry(arr => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i === 0) return NaN
    return arr[i] - arr[i - 1]
  }, iRange)
  return result
})

/**
 * Calculate rolling statistics
 *
 * Calculate statistics over a moving window.
 * Works with Z.min, Z.max, Z.mean, Z.std, Z.sum, Z.prod, or any other function
 * that takes an array as a single argument.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Function} func Function to caclulate rolling statistics
 * @param {Number} n Range (?)
 * @param {Array} arr Series to calculate rolling statistics for
 * @return {Array}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.rolling(Z.mean, 2, series)
 * // ["NotANumber", 4.5, 16, 30, 43, 65.5]
 */
const rolling = (func, n, arr) => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    if (i + 1 < n) return "NotANumber"
    const truncated = R.slice(i - n + 1, i + 1, arr)
    return func(truncated)
  }, iRange)
  return result
}

/**
 * Calculate cumulative statistics.
 *
 * Calculate statistics over a cumulative window from the start of the array.
 * Works wtih z.min, z.max, z.mean, z.std, z.sum, z.prod, etc., or any other
 * function that takes an array as a single argument.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Function} func Function to caclulate cumulative statistics
 * @param {Array} arr Series to calculate cumulative statistics for
 * @return {Array}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.cumulative(Z.mean, series)
 * // [7, 4.5, 13, 17.25, 25, 33.333333333333336]
 */
const cumulative = (func, arr) => {
  const iRange = R.range(0, arr.length)
  const result = R.map(i => {
    const truncated = R.slice(0, i + 1, arr)
    return func(truncated)
  }, iRange)
  return result
}

/**
 * Calculate summary statistics for a numerical series.
 *
 * Returns a single-row df with count, unique count, min, max, median, mean and
 * standard deviation of a numerical series.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {Function} func Function to caclulate cumulative statistics
 * @param {Array} arr Series to calculate cumulative statistics for
 * @return {Number}
 * @example
 *
 * const series = [7, 2, 30, 30, 56, 75]
 * Z.describe(series)
 * // [{"count": 6, "countUnique": 5, "max": "75.00000", "mean": "33.33333", "median": "30.00000", "min": "2.00000", "std": "28.09745"}]
 */
const describe = arr => [
  {
    count: arr.length,
    countUnique: countUnique(arr),
    min: min(arr).toFixed(5),
    max: max(arr).toFixed(5),
    median: median(arr).toFixed(5),
    mean: mean(arr).toFixed(5),
    std: std(arr).toFixed(5),
  },
]

/**
 * Join two dataframes on a column.
 *
 * Performs a left join on two dataframes.
 * The 'On' arguments set which column in each df to join on.
 * The 'Suffix' arguments determine what the suffix should be when the two
 * dataframes have overlapping column names besides the one being joined on.
 *
 * @func
 * @memberOf Z
 * @category Manipulation
 * @param {df} dfLeft First dataframe
 * @param {df} dfRight Second dataframe
 * @param {String} leftOn Left column to join on
 * @param {String} rightOn Right column to join on
 * @param {String} leftSuffix Left suffix for overlapping column names
 * @param {String} rightSuffix Right suffix for overlapping column names
 * @return {df} Joined dataframe
 * @example
 *
 * const df1 = [{"label": "A", "value": 7}, {"label": "B", "value": 2}, {"label": "C", "value": 75}]
 * const df2 = [{"label": "A", "value": "2010-12-13"}, {"label": "B", "value": "2010-12-15"}, {"label": "C", "value": "2010-12-17"}]
 * Z.merge(df1, df2, "label", "label", "_df1", "_df2")
 * // [
 * //   { label: "A", value_df1: 7, value_df2: "2010-12-13" },
 * //   { label: "B", value_df1: 2, value_df2: "2010-12-15" },
 * //   { label: "C", value_df1: 75, value_df2: "2010-12-17" },
 * // ]
 */
const merge = (dfLeft, dfRight, leftOn, rightOn, leftSuffix, rightSuffix) => {
  const colsLeft = R.keys(dfLeft[0])
  const colsRight = R.keys(dfRight[0])
  const intersection = R.filter(
    x => !R.includes(x, [leftOn, rightOn]),
    R.intersection(colsLeft, colsRight)
  )

  const renameCol = (oldColName, suffix, { [oldColName]: old, ...others }) => ({
    [oldColName + suffix]: old,
    ...others,
  })

  const renameDuplicateColumns = (cols, arr, suffix) => {
    let renamed = arr
    cols.forEach(c => {
      renamed = arr.map(r => renameCol(c, suffix, r))
    })
    return renamed
  }

  const dfLeftUpdated = renameDuplicateColumns(intersection, dfLeft, leftSuffix)
  const dfRightUpdated = renameDuplicateColumns(
    intersection,
    dfRight,
    rightSuffix
  )
  const colsLeftUpdated = R.keys(dfLeftUpdated[0])
  const colsRightUpdated = R.keys(dfRightUpdated[0])

  const colsAll = Array.from(new Set([...colsLeftUpdated, ...colsRightUpdated]))
  const dfLeftGrouped = R.groupBy(R.prop(leftOn), dfLeftUpdated)
  const dfRightGrouped = R.groupBy(R.prop(rightOn), dfRightUpdated)
  const index = R.keys(dfLeftGrouped)
  const fillRow = (row, cols) => {
    const rowCols = R.keys(row)
    const filledRow = row
    R.difference(cols, rowCols).forEach(c => {
      filledRow[c] = undefined
    })
    return row
  }
  return index.map(i => {
    try {
      return fillRow(
        { ...dfLeftGrouped[i]["0"], ...dfRightGrouped[i]["0"] },
        colsAll
      )
    } catch (err) {
      return fillRow({ ...dfLeftGrouped[i]["0"] }, colsAll)
    }
  })
}

/**
 * Calculate sums for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbMin, Z.gbMax, Z.gbCount, Z.gbMean, Z.gbStd, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbSum("value", Z.groupBy(d => d.label, df))
 * // [{"group": "A", "sum": 10}, {"group": "B", "sum": 7}, {"group": "C", "sum": 75}]
 */
const gbSum = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(i => {
    const df = groupByObj[i]
    const arr = getCol(col, df)
    const arrFiltered = R.filter(isNumeric, arr)
    return { group: i, sum: R.sum(arrFiltered) }
  })
  return result
}

/**
 * Calculate mean for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbMin, Z.gbMax, Z.gbCount, Z.gbSum, Z.gbStd, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbMean("value", Z.groupBy(d => d.label, df))
 * // [{"group": "A", "mean": 5}, {"group": "B", "mean": 3.5}, {"group": "C", "mean": 75}]
 */
const gbMean = (col, groupByObj) => {
  const summed = gbSum(col, groupByObj)
  const result = summed.map(i => {
    const count = groupByObj[i.group].length
    return { group: i.group, mean: i.sum / count }
  })
  return result
}

/**
 * Calculate std for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbMin, Z.gbMax, Z.gbCount, Z.gbSum, Z.gbMean, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbStd("value", Z.groupBy(d => d.label, df))
 * // [{"group": "A", "std": 2.8284271247461903}, {"group": "B", "std": 2.1213203435596424}, {"group": "C", "std": NaN}]
 */
const gbStd = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => {
    const arr = R.filter(isNumeric, getCol(col, groupByObj[g]))
    const avg = R.mean(arr)
    const arrSquaredDiffs = R.map(x => (x - avg) ** 2, arr)
    const sumSquaredDiffs = R.sum(arrSquaredDiffs)
    return { group: g, std: Math.sqrt(sumSquaredDiffs / (arr.length - 1)) }
  })
  return result
}

/**
 * Calculate count for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbMin, Z.gbMax, Z.gbStd, Z.gbSum, Z.gbMean, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbCount("value", Z.groupBy(d => d.label, df))
 * // [{"count": 2, "group": "A"}, {"count": 2, "group": "B"}, {"count": 1, "group": "C"}]
 */
const gbCount = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  return groups.map(g => ({ group: g, count: groupByObj[g].length }))
}

/**
 * Calculate min for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbStd, Z.gbMax, Z.gbCount, Z.gbSum, Z.gbMean, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbMin("value", Z.groupBy(d => d.label, df))
 * // [{"group": "A", "min": 3}, {"group": "B", "min": 2}, {"group": "C", "min": 75}]
 */
const gbMin = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => ({
    group: g,
    min: R.reduce(
      (acc, value) => R.min(acc, value[col]),
      Infinity,
      groupByObj[g]
    ),
  }))
  return result
}

/**
 * Calculate max for grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbStd, Z.gbMin, Z.gbCount, Z.gbSum, Z.gbMean, Z.gbDescribe
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbMax("value", Z.groupBy(d => d.label, df))
 * // [{"group": "A", "max": 7}, {"group": "B", "max": 5}, {"group": "C", "max": 75}]
 */
const gbMax = (col, groupByObj) => {
  const groups = R.keys(groupByObj)
  const result = groups.map(g => ({
    group: g,
    max: R.reduce(
      (acc, value) => R.max(acc, value[col]),
      -Infinity,
      groupByObj[g]
    ),
  }))
  return result
}

/**
 * Describe grouped objects.
 *
 * Use it on groupBy objects - the output of Z.groupBy() - to analyze groups.
 *
 * @func
 * @memberOf Z
 * @category Analysis
 * @param {String} col Column within the groups to be analyzed
 * @param {Object} groupByObj Object grouped by a column
 * @return {df} Dataframe with the calculated statistics
 * @see Z.groupBy, Z.gbStd, Z.gbMin, Z.gbCount, Z.gbSum, Z.gbMean, Z.max
 * @example
 *
 * const df = [{"label": "A", "value": 7}, {"label": "A", "value": 3}, {"label": "B", "value": 2},  {"label": "B", "value": 5}, {"label": "C", "value": 75}]
 * Z.gbDescribe("value", Z.groupBy(d => d.label, df))
 * // [
 * //   { count: 2, group: "A", max: 7, mean: 5, min: 3, std: 2.8284271247461903, sum: 10 },
 * //   { count: 2, group: "B", max: 5, mean: 3.5, min: 2, std: 2.1213203435596424, sum: 7 },
 * //   { count: 1, group: "C", max: 75, mean: 75, min: 75, std: NaN, sum: 75 },
 * // ]
 */
const gbDescribe = (col, groupByObj) => {
  const mins = gbMin(col, groupByObj)
  const maxes = gbMax(col, groupByObj)
  const counts = gbCount(col, groupByObj)
  const sums = gbSum(col, groupByObj)
  const means = gbMean(col, groupByObj)
  const stds = gbStd(col, groupByObj)
  const df1 = merge(mins, maxes, "group", "group", "--", "--")
  const df2 = merge(df1, counts, "group", "group", "--", "--")
  const df3 = merge(df2, sums, "group", "group", "--", "--")
  const df4 = merge(df3, means, "group", "group", "--", "--")
  const df5 = merge(df4, stds, "group", "group", "--", "--")
  return df5
}

module.exports = {
  readCSV,
  toCSV,
  filter,
  parseNums,
  pickCols,
  getCol,
  mean,
  median,
  std,
  pipe,
  concat,
  groupBy,
  slice,
  unique,
  countUnique,
  corr,
  min,
  max,
  getRange,
  dropCol,
  valueCounts,
  addCol,
  deriveCol,
  print,
  printHead,
  printTail,
  pctChange,
  rolling,
  parseDates,
  sort,
  sortByCol,
  describe,
  merge,
  gbSum,
  gbMean,
  gbCount,
  gbMin,
  gbMax,
  gbStd,
  gbDescribe,
  cumulative,
  sum,
  prod,
  diff,
  skew,
  kurt,
  head,
  tail,
}
