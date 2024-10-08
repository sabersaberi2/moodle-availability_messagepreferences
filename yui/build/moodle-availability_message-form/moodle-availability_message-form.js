YUI.add('moodle-availability_message-form', function (Y, NAME) {

/**
 * JavaScript for form editing message conditions.
 *
 * @module moodle-availability_message-form
 */
M.availability_message = M.availability_message || {};

/**
 * @class M.availability_message.form
 * @extends M.core_availability.plugin
 */
M.availability_message.form = Y.Object(M.core_availability.plugin);

/**
 * Groupings available for selection (alphabetical order).
 *
 * @property messages
 * @type Array
 */
M.availability_message.form.messages = null;

/**
 * Initialises this plugin.
 *
 * @method initInner
 * @param {Array} standardFields Array of objects with .field, .display
 * @param {Array} customFields Array of objects with .field, .display
 */
M.availability_message.form.initInner = function(standardFields, customFields) {
    this.standardFields = standardFields;
    this.customFields = customFields;
};

M.availability_message.form.getNode = function(json) {
    // Create HTML structure.
    var html = '<span class="availability-group"><label><span class="pr-3">' +
            M.util.get_string('conditiontitle', 'availability_message') + '</span> ' +
            '<select name="field" class="custom-select">' +
            '<option value="choose">' + M.util.get_string('choosedots', 'moodle') + '</option>';
    var fieldInfo;
    for (var i = 0; i < this.standardFields.length; i++) {
        fieldInfo = this.standardFields[i];
        // String has already been escaped using format_string.
        html += '<option value="sf_' + fieldInfo.field + '">' + fieldInfo.display + '</option>';
    }
    for (i = 0; i < this.customFields.length; i++) {
        fieldInfo = this.customFields[i];
        // String has already been escaped using format_string.
        html += '<option value="cf_' + fieldInfo.field + '">' + fieldInfo.display + '</option>';
    }
    html += '</select></label> <label><span class="accesshide">' + M.util.get_string('label_operator', 'availability_message') +
            ' </span><select name="op" title="' + M.util.get_string('label_operator', 'availability_message') + '"' +
                     ' class="custom-select">';
    var operators = ['isequalto', 'contains', 'doesnotcontain', 'startswith', 'endswith',
            'isempty', 'isnotempty'];
    for (i = 0; i < operators.length; i++) {
        html += '<option value="' + operators[i] + '">' +
                M.util.get_string('op_' + operators[i], 'availability_message') + '</option>';
    }
    html += '</select></label> <label><span class="accesshide">' + M.util.get_string('label_value', 'availability_message') +
            '</span><input name="value" type="text" class="form-control" style="width: 10em" title="' +
            M.util.get_string('label_value', 'availability_message') + '"/></label></span>';
    var node = Y.Node.create('<span class="form-inline">' + html + '</span>');

    // Set initial values if specified.
    if (json.sf !== undefined &&
            node.one('select[name=field] > option[value=sf_' + json.sf + ']')) {
        node.one('select[name=field]').set('value', 'sf_' + json.sf);
    } else if (json.cf !== undefined &&
            node.one('select[name=field] > option[value=cf_' + json.cf + ']')) {
        node.one('select[name=field]').set('value', 'cf_' + json.cf);
    }
    if (json.op !== undefined &&
            node.one('select[name=op] > option[value=' + json.op + ']')) {
        node.one('select[name=op]').set('value', json.op);
        if (json.op === 'isempty' || json.op === 'isnotempty') {
            node.one('input[name=value]').set('disabled', true);
        }
    }
    if (json.v !== undefined) {
        node.one('input').set('value', json.v);
    }

    // Add event handlers (first time only).
    if (!M.availability_message.form.addedEvents) {
        M.availability_message.form.addedEvents = true;
        var updateForm = function(input) {
            var ancestorNode = input.ancestor('span.availability_message');
            var op = ancestorNode.one('select[name=op]');
            var novalue = (op.get('value') === 'isempty' || op.get('value') === 'isnotempty');
            ancestorNode.one('input[name=value]').set('disabled', novalue);
            M.core_availability.form.update();
        };
        var root = Y.one('.availability-field');
        root.delegate('change', function() {
             updateForm(this);
        }, '.availability_message select');
        root.delegate('change', function() {
             updateForm(this);
        }, '.availability_message input[name=value]');
    }

    return node;
};

M.availability_message.form.fillValue = function(value, node) {
    // Set field.
    var field = node.one('select[name=field]').get('value');
    if (field.substr(0, 3) === 'sf_') {
        value.sf = field.substr(3);
    } else if (field.substr(0, 3) === 'cf_') {
        value.cf = field.substr(3);
    }

    // Operator and value
    value.op = node.one('select[name=op]').get('value');
    var valueNode = node.one('input[name=value]');
    if (!valueNode.get('disabled')) {
        value.v = valueNode.get('value');
    }
};

M.availability_message.form.fillErrors = function(errors, node) {
    var value = {};
    this.fillValue(value, node);

    // Check message item id.
    if (value.sf === undefined && value.cf === undefined) {
        errors.push('availability_message:error_selectfield');
    }
    if (value.v !== undefined && /^\s*$/.test(value.v)) {
        errors.push('availability_message:error_setvalue');
    }
};


}, '@VERSION@', {"requires": ["base", "node", "event", "moodle-core_availability-form"]});
