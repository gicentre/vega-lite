/* tslint:disable quotemark */

import {assert} from 'chai';
import {X, Y} from '../../../src/channel';
import {text} from '../../../src/compile/mark/text';
import {UnitModel} from '../../../src/compile/unit';
import {FacetedCompositeUnitSpec, UnitSpec} from '../../../src/spec';
import {parseModelWithScale, parseUnitModelWithScaleAndLayoutSize} from '../../util';

describe('Mark: Text', function() {
  describe('with stacked x', function() {
    // This is a simplified example for stacked text.
    // In reality this will be used as stacked's overlayed marker
    const model = parseUnitModelWithScaleAndLayoutSize({
      "mark": "text",
      "encoding": {
        "x": {"aggregate": "sum", "field": "a", "type": "quantitative"},
        "color": {"field": "b", "type": "ordinal"}
      },
      "data": {"url": "data/barley.json"},
      "config": {"stack":  "zero"}
    });

    const props = text.encodeEntry(model);

    it('should use stack_end on x', function() {
      assert.deepEqual(props.x, {scale: X, field: 'sum_a_end'});
    });
  });

  describe('with stacked y', function() {
    // This is a simplified example for stacked text.
    // In reality this will be used as stacked's overlayed marker
    const model = parseUnitModelWithScaleAndLayoutSize({
      "mark": "text",
      "encoding": {
        "y": {"aggregate": "sum", "field": "a", "type": "quantitative"},
        "color": {"field": "b", "type": "ordinal"}
      },
      "data": {"url": "data/barley.json"},
      "config": {"stack":  "zero"}
    });

    const props = text.encodeEntry(model);

    it('should use stack_end on y', function() {
      assert.deepEqual(props.y, {scale: Y, field: 'sum_a_end'});
    });
  });

  describe('with quantitative and format', function() {
    const spec: UnitSpec = {
      "mark": "text",
      "encoding": {
        "text": {"field": "foo", "type": "quantitative", "format": "d"}
      }
    };
    const model = parseUnitModelWithScaleAndLayoutSize(spec);
    const props = text.encodeEntry(model);

    it('should use number template', function() {
      assert.deepEqual(props.text, {signal: `format(datum["foo"], "d")`});
    });
  });

  describe('with binned quantitative', function() {
    const spec: UnitSpec = {
      "mark": "text",
      "encoding": {
        "text": {"bin": true, "field": "foo", "type": "quantitative", "format": "d"}
      }
    };
    const model = parseUnitModelWithScaleAndLayoutSize(spec);
    const props = text.encodeEntry(model);

    it('should output correct bin range', function() {
      assert.deepEqual(props.text, {signal: `datum["bin_maxbins_10_foo"] === null || isNaN(datum["bin_maxbins_10_foo"]) ? "null" : format(datum["bin_maxbins_10_foo"], "d") + " - " + format(datum["bin_maxbins_10_foo_end"], "d")`});
    });
  });

  describe('with temporal', function() {
    const spec: UnitSpec = {
      "mark": "text",
      "encoding": {
        "text": {"field": "foo", "type": "temporal"}
      }
    };
    const model = parseUnitModelWithScaleAndLayoutSize(spec);
    const props = text.encodeEntry(model);

    it('should use date template', function() {
      assert.deepEqual(props.text, {signal: `timeFormat(datum["foo"], '%b %d, %Y')`});
    });
  });

  describe('with x, y, text (ordinal)', function() {
    const spec: UnitSpec = {
      "mark": "text",
      "encoding": {
        "x": {"field": "Acceleration", "type": "ordinal"},
        "y": {"field": "Displacement", "type": "quantitative"},
        "text": {"field": "Origin", "type": "ordinal"},
      },
      "data": {"url": "data/cars.json"}
    };
    const model = parseUnitModelWithScaleAndLayoutSize(spec);
    const props = text.encodeEntry(model);

    it('should scale on x', function() {
      assert.deepEqual(props.x, {scale: X, field: 'Acceleration'});
    });
    it('should scale on y', function(){
      assert.deepEqual(props.y, {scale: Y, field: 'Displacement'});
    });

    it('should be centered', function() {
      assert.deepEqual(props.align, {value: "center"});
    });

    it('should map text without template', function() {
      assert.deepEqual(props.text, {signal: `''+datum["Origin"]`});
    });
  });

  describe('with row, column, text, and color', function() {
    const spec: FacetedCompositeUnitSpec = {
        "mark": "text",
        "encoding": {
          "row": {"field": "Origin", "type": "ordinal"},
          "column": {"field": "Cylinders", "type": "ordinal"},
          "text": {"field": "Acceleration", "type": "quantitative", "aggregate": "mean"},
          "color": {"field": "Acceleration", "type": "quantitative", "aggregate": "mean"},
          "size": {"field": "Acceleration", "type": "quantitative", "aggregate": "mean"}
        },
        "data": {"url": "data/cars.json"}
      };
    const model = parseModelWithScale(spec);
    model.parseLayoutSize();

    const childModel = model.children[0] as UnitModel;
    const props = text.encodeEntry(childModel);

    it('should fit the view on x', function() {
      assert.deepEqual(props.x, {field: {group: 'width'}, offset: -5});
    });

    it('should center on y', function() {
      assert.deepEqual(props.y, {
        mult: 0.5,
        signal: 'child_height'
      });
    });

    it('should map text to expression', function() {
      assert.deepEqual(props.text, {
        signal: `format(datum["mean_Acceleration"], "")`
      });
    });

    it('should map color to fill', function() {
      assert.deepEqual(props.fill, {
        scale: 'color',
        field: 'mean_Acceleration'
      });
    });

    it('should map size to fontSize', function() {
      assert.deepEqual(props.fontSize, {
        scale: 'size',
        field: 'mean_Acceleration'
      });
    });
  });
});
