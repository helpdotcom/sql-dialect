var BaseInsert = require('../insert');

/**
 * `INSERT` statement.
 */
class Insert extends BaseInsert {
  /**
   * Sets some fields to the `RETURNING` clause.
   *
   * @param  Object|Array fields The fields.
   * @return Function            Returns `this`.
   */
  returning(fields) {
    var fields = Array.isArray(fields) && arguments.length === 1 ? fields : Array.prototype.slice.call(arguments);
    if (fields.length) {
      this._parts.returning = this._parts.returning.concat(fields);
    }
    return this;
  }
}

module.exports = Insert;