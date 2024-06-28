/**
 * @module IwProps
 * @description 所有对外暴露的属性 / All exposed properties
 *
 * 入口配置请参见 {@link SimpleTableProps} 。
 *
 * Entry configuration, please refer to {@link SimpleTableProps}.
 *
 * NOTE: 所有``Simple``开头的属性都是简化版的配置，可直接使用，系统会填充相应的默认值。
 *
 * NOTE: All properties starting with ``Simple`` are simplified configurations that can be used directly, and the system will fill in the corresponding default values.
 *
 * 一个表格有一个或多个布局，配置分为表格级别与布局级别，表格级与布局级会共享一些配置 {@link CommonFunctionProps} {@link CommonColumnProps}。
 * 表格级的配置作用于所有布局，布局级的配置可以继承并覆盖表格级的配置。
 *
 * A table has one or more layouts, and the configuration is divided into table level and layout level.
 * The table level and layout level will share some configurations {@link CommonFunctionProps} {@link CommonColumnProps}.
 * The configuration of the table level applies to all layouts, and the configuration of the layout level can inherit and override the configuration of the table level.
 */

export * from './basicProps'
export * from './enumProps'
export * from './eventProps'
export * from './functionProps'
export * from './kernelProps'
