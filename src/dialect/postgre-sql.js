import {extend, merge} from 'extend-merge';

import Dialect from '../dialect';
import Select from '../statement/postgresql/select';
import Insert from '../statement/postgresql/insert';
import Update from '../statement/postgresql/update';
import Delete from '../statement/postgresql/delete';
import CreateTable from '../statement/create-table';
import DropTable from '../statement/drop-table';

/**
 * PostgreSQL dialect.
 */
class PostgreSql extends Dialect {
  /**
   * Constructor
   *
   * @param Object config The config array
   */
  constructor(config) {
    var defaults = {
      classes: PostgreSql._classes,
      operators: {
        ':regexp'        : { format: '%s ~ %s' },
        ':regexi'        : { format: '%s ~* %s' },
        ':not regexp'    : { format: '%s !~ %s' },
        ':not regexi'    : { format: '%s !~* %s' },
        ':square root'   : { format: '|/ %s' },
        ':cube root'     : { format: '||/ %s' },
        ':fact'          : { format: '!! %s' },
        '|/'             : { format: '|/ %s' },
        '||/'            : { format: '||/ %s' },
        '!!'             : { format: '!! %s' },
        ':concat'        : { format: '%s || %s' },
        ':pow'           : { format: '%s ^ %s' },
        '@'              : { format: '@ %s' },
        // Algebraic operations
        ':union'         : { builder: 'set' },
        ':union all'     : { builder: 'set' },
        ':except'        : { builder: 'set' },
        ':except all'    : { builder: 'set' },
        ':intersect'     : { builder: 'set' },
        ':intersect all' : { builder: 'set' }
      }
    };

    var config = merge(defaults, config);
    super(config);

    /**
     * Escape identifier character.
     *
     * @var String
     */
    this._escape = '"';

    /**
     * Meta attribute syntax pattern.
     *
     * @var Object
     */
    this._meta = {
      table: {
        tablespace: { keyword: 'TABLESPACE' }
      }
    };

    /**
     * Column contraints
     *
     * @var array
     */
    this._constraints = {
      'primary': { template: 'PRIMARY KEY (${column})' },
      'foreign key': {
        template: 'FOREIGN KEY (${foreignKey}) REFERENCES ${to} (${primaryKey}) ${on}'
      },
      'unique': {
        template: 'UNIQUE ${index} (${column})'
      },
      'check': { template: '${constraint} CHECK (${expr})' }
    };

    this.type('id',       { use: 'integer' });
    this.type('serial',   { use: 'serial', serial: true });
    this.type('string',   { use: 'varchar', length: 255 });
    this.type('text',     { use: 'text' });
    this.type('integer',  { use: 'integer' });
    this.type('boolean',  { use: 'boolean' });
    this.type('float',    { use: 'real' });
    this.type('decimal',  { use: 'numeric', precision: 2 });
    this.type('date',     { use: 'date' });
    this.type('time',     { use: 'time' });
    this.type('datetime', { use: 'timestamp' });
    this.type('binary',   { use: 'bytea' });

    this.map('bit',                         'string');
    this.map('bool',                        'boolean');
    this.map('boolean',                     'boolean');
    this.map('box',                         'string');
    this.map('bytea',                       'binary');
    this.map('char',                        'string');
    this.map('character',                   'string');
    this.map('character varying',           'string');
    this.map('cidr',                        'string');
    this.map('circle',                      'string');
    this.map('date',                        'date');
    this.map('decimal',                     'string');
    this.map('float4',                      'float');
    this.map('float8',                      'float');
    this.map('inet',                        'string');
    this.map('int2',                        'integer');
    this.map('int4',                        'integer');
    this.map('int8',                        'integer');
    this.map('integer',                     'integer');
    this.map('json',                        'string');
    this.map('lseg',                        'string');
    this.map('line',                        'string');
    this.map('macaddr',                     'string');
    this.map('numeric',                     'decimal');
    this.map('path',                        'string');
    this.map('polygon',                     'string');
    this.map('real',                        'float');
    this.map('serial',                      'serial');
    this.map('string',                      'string');
    this.map('text',                        'string');
    this.map('time',                        'time');
    this.map('time with time zone',         'time');
    this.map('time without time zone',      'time');
    this.map('timestamp',                   'datetime');
    this.map('timestamp with time zone',    'datetime');
    this.map('timestamp without time zone', 'datetime');
    this.map('timestamptz',                 'datetime');
    this.map('tsquery',                     'string');
    this.map('tsvector',                    'string');
    this.map('txid_snapshot',               'string');
    this.map('uuid',                        'string');
    this.map('varbit',                      'string');
    this.map('varchar',                     'string');
    this.map('xml',                         'string');
  }

  /**
   * Helper for creating columns
   *
   * @see    Dialect::column()
   *
   * @param  Object field A field definition
   * @return String       The SQL column string
   */
  _column(field) {
    var name = field.name;
    var use = field.use;
    var type = field.type;
    var length = field.length;
    var precision = field.precision;
    var serial = field.serial;
    var nil = field.null;
    var dft = field['default'];

    if (type === 'float' && precision) {
      use = 'numeric';
    }

    var column = this.name(name) + ' ' + this._formatColumn(use, length, precision);

    var result = [column];

    if (serial) {
      result.push('NOT NULL');
    } else {
      result.push(typeof nil === 'boolean' ? (nil ? 'NULL' : 'NOT NULL') : '');
      if (dft != null) {
        if (dft.constructor === Object) {
          var operator = Object.keys(dft)[0];
          dft = dft[operator];
        } else {
          operator = ':value';
        }
        result.push('DEFAULT ' + this.format(operator, dft, { field: field }));
      }
    }

    result.push(this.meta('column', field, ['comment']));
    result = result.filter(function(value) {
      return !!value;
    });
    return result.join(' ');
  }
}

/**
 * Class dependencies.
 *
 * @var array
 */
PostgreSql._classes = {
  'select'      : Select,
  'insert'      : Insert,
  'update'      : Update,
  'delete'      : Delete,
  'create table': CreateTable,
  'drop table'  : DropTable
};

export default PostgreSql;