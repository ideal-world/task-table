[@idealworld/task-table](../exports.md) / TableEventProps

# Interface: TableEventProps

## Contents

- [Properties](TableEventProps.md#properties)
  - [deleteColumn](TableEventProps.md#deletecolumn)
  - [deleteData](TableEventProps.md#deletedata)
  - [deleteLayout](TableEventProps.md#deletelayout)
  - [loadCellOptions](TableEventProps.md#loadcelloptions)
  - [loadData](TableEventProps.md#loaddata)
  - [modifyColumn](TableEventProps.md#modifycolumn)
  - [modifyLayout](TableEventProps.md#modifylayout)
  - [modifyStyles](TableEventProps.md#modifystyles)
  - [newColumn](TableEventProps.md#newcolumn)
  - [newLayout](TableEventProps.md#newlayout)
  - [saveData](TableEventProps.md#savedata)
  - [sortLayouts](TableEventProps.md#sortlayouts)

## Properties

### deleteColumn

> **deleteColumn**?: (`deletedColumnName`) => `Promise`\<`boolean`\>

#### Parameters

▪ **deletedColumnName**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:130](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L130)

***

### deleteData

> **deleteData**?: (`deletedPks`) => `Promise`\<`boolean`\>

#### Parameters

▪ **deletedPks**: `any`[]

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:126](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L126)

***

### deleteLayout

> **deleteLayout**?: (`deletedLayoutId`) => `Promise`\<`boolean`\>

#### Parameters

▪ **deletedLayoutId**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:138](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L138)

***

### loadCellOptions

> **loadCellOptions**?: (`columnName`, `cellValue`) => `Promise`\<`object`[]\>

#### Parameters

▪ **columnName**: `string`

▪ **cellValue**: `any`

#### Returns

`Promise`\<`object`[]\>

#### Source

[components/props.ts:132](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L132)

***

### loadData

> **loadData**: (`filters`?, `sorts`?, `group`?, `aggs`?, `slice`?) => `Promise`\<[`TableDataResp`](TableDataResp.md) \| [`TableDataGroupResp`](TableDataGroupResp.md)[]\>

#### Parameters

▪ **filters?**: [`TableDataFilterReq`](TableDataFilterReq.md)[]

▪ **sorts?**: [`TableDataSortReq`](TableDataSortReq.md)[]

▪ **group?**: [`TableDataGroupReq`](TableDataGroupReq.md)

▪ **aggs?**: `object`

▪ **slice?**: [`TableDataSliceReq`](TableDataSliceReq.md)

#### Returns

`Promise`\<[`TableDataResp`](TableDataResp.md) \| [`TableDataGroupResp`](TableDataGroupResp.md)[]\>

#### Source

[components/props.ts:120](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L120)

***

### modifyColumn

> **modifyColumn**?: (`changedColumnProps`) => `Promise`\<`boolean`\>

#### Parameters

▪ **changedColumnProps**: [`TableColumnProps`](TableColumnProps.md)

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:129](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L129)

***

### modifyLayout

> **modifyLayout**?: (`changedLayoutProps`) => `Promise`\<`boolean`\>

#### Parameters

▪ **changedLayoutProps**: [`TableLayoutModifyReq`](TableLayoutModifyReq.md)

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:137](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L137)

***

### modifyStyles

> **modifyStyles**?: (`changedStyleProps`) => `Promise`\<`boolean`\>

#### Parameters

▪ **changedStyleProps**: [`TableStyleProps`](TableStyleProps.md)

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:134](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L134)

***

### newColumn

> **newColumn**?: (`newColumnProps`, `fromColumnName`?) => `Promise`\<`boolean`\>

#### Parameters

▪ **newColumnProps**: [`TableColumnProps`](TableColumnProps.md)

▪ **fromColumnName?**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:128](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L128)

***

### newLayout

> **newLayout**?: (`newLayoutProps`, `fromLayoutId`?) => `Promise`\<`boolean`\>

#### Parameters

▪ **newLayoutProps**: [`TableLayoutProps`](TableLayoutProps.md)

▪ **fromLayoutId?**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:136](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L136)

***

### saveData

> **saveData**?: (`changedRecords`) => `Promise`\<`boolean`\>

#### Parameters

▪ **changedRecords**: `object`[]

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:125](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L125)

***

### sortLayouts

> **sortLayouts**?: (`leftLayoutId`, `rightLayoutId`) => `Promise`\<`boolean`\>

#### Parameters

▪ **leftLayoutId**: `string`

▪ **rightLayoutId**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Source

[components/props.ts:139](https://github.com/ideal-world/task-table/blob/b775b5f/src/components/props.ts#L139)

***

Generated using [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown) and [TypeDoc](https://typedoc.org/)
