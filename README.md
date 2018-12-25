# zebras - data analysis library for javascript

<div align="center"><img src ="code_example.png" width = "60%" /></div>

Zebras is a data manipulation and analysis library written in JavaScript offering the convenience of pandas or R. 

Zebras is especially useful for JS data analysis and visualization projects in notebooks on [ObservableHQ](https://beta.observablehq.com/) or using the [JS Jupyter kernel](https://github.com/n-riesco/ijavascript). 

Unlike pandas, zebras is purely functional. All zebras functions accept data as an argument and return a new data structure transformed. 'Dataframes' are simply arrays of JS objects without any special methods. 

Zebras is built on top of [Ramda](https://github.com/Ramda/ramda). Think of zebras as a collection of Ramda functions, and compositions of them, curated and repackaged for common data processing and data analysis tasks. 

As in Ramda, all zebras functions are curried, making them easier to chain together. This means that, for example, `zebras.sortByCol(col, df)` is equivalent to `zebras.sortByCol(col)(df)`. 


## To Install
### Locally with Node / Jupyter
`npm install zebras --save`
`const z = require('zebras')`

### Online in an Observable notebook
`z = require('https://bundle.run/zebras')`

## Example Usage
```javascript
const z = require('zebras')
const data = z.readCSV('data.csv')
const parsedData = z.parseNums(['speed','acc'], data)
const speed = z.getCol('speed', parsedData)
const avgSpeed = z.mean(speed)
```

Piping example:

```javascript
const z = require('zebras')
const avgSpeed = z.pipe(
  [           // array of functions for input to travel through
    z.readCSV,
    z.parseNums(['speed','acc']),
    z.getCol('speed'),
    z.mean
  ]
)('data.csv')
```

## Documentation

In the documentation, `df` signifies an array of Javascript objects, while `arr` is a simple Javascript array of values.

### IO

#### Read a CSV file
`z.readCSV(filepath)`

Or if you're working in Observable:
`d3 = require("d3")`
`data = d3.csv(csv-url)`

#### Write a CSV file
`z.toCSV(filepath, df)`

#### Print dataframe
`z.print(df)`

#### Print first n rows of dataframe
`z.head(n, df)`

#### Print last n rows of dataframe
`z.tail(n, df)`

### Manipulating dataframes

#### Filter rows
`z.filter(func, df)`

#### Sort rows by a column
`z.sortByCol(columnName, direction, df)`
`direction = 'asc'` for ascending and `direction = 'desc'` for descending

#### Sort rows using custom sorting function
`z.sort(func, df)`

#### Convert columns to numerical type
`z.parseNums(columnNamesArray, df)`

#### Convert columns to datestamp
`z.parseDates(columnNamesArray, df)`

#### Select a subset of columns
`z.pickCols(columnNamesArray, df)`

#### Concatenate two dataframes
`z.concat(df1, df2)`

#### Get rows by index
`z.slice(start, end, df)`

#### Add a new column to a dataframe from an array
`z.addCol(columnName, arr, df)`

#### Create a new array based on columns from existing array
`z.deriveCol(func, df)`

### Analyzing series

#### Extract a series to an array from a dataframe
`z.getCol(columnName, df)`

#### Min of series:
`z.min(arr)`

#### Max of series
`z.max(arr)`

#### Range of series
`z.getRange(arr)`

#### Mean of series
`z.mean(arr)`

#### Median of series
`z.median(arr)`

#### Standard deviation of series
`z.std(arr)`

#### Correlation between two series
`z.corr(arr1,arr2)`

#### Percent changes
`z.pctChange(arr)`

#### Calculate rolling statistics (works with z.min, z.max, z.mean, z.median, z.std or any user-supplied function that takes an array as a single argument)
`z.rolling(func, n, arr)`

#### Get unique values:
`z.unique(arr)`

#### Count number of unique values
`z.countUnique(arr)`

#### Count number of occurences of each value
`z.valueCounts(arr)`

#### Create groupBy object
`z.groupBy(func, df)`

### Composition

#### Pipe functions together
`z.pipe([functions], df)`
