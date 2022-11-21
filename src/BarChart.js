import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import './BarChart.css';
import PropTypes from 'prop-types';

const BarChart = props => {
  //sets graph title
  const title = props.json.title;
  let data = props.json.data;
  let ref = useRef(null);

  const margin = 100;
  //gets key names for x and y axis
  const key1 = Object.keys(data[0])[0];
  const key2 = Object.keys(data[0])[1]; //population

  useEffect(() => {
    //clears during render
    d3.select('g').remove();
    // init svg with height and width
    let svg = d3.select(ref.current);
    let g = svg.append('g').attr('transform', 'translate(' + 50 + ',' + 50 + ')');
    let w = svg.attr('width') - margin;
    let h = svg.attr('height') - margin;

    // sets graph title
    g.append('text')
      .attr('x', w / 2)
      .attr('y', 30)
      .style('text-anchor', 'middle')
      .style('font-size', '20px')
      .text(title);

    // sets x axis title
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 40)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(key1);

    // sets y axis title
    g.append('text')
      .attr('x', -(w - margin) / 2)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(key2);

    // defines x scale
    let xScale = d3
      .scaleBand()
      .range([0, w])
      .padding(0.2)
      .domain(data.map(d => d[key1]));

    // defines y scale
    let yMin = props.min === null ? 0 : props.min;
    let yMax = props.max;
    // checks for null
    if (yMax === null) {
      yMax = Math.ceil(Math.max(...data.map(d => d[key2])) * 1.1);
    }
    // checks if yMin and yMax is valid
    if (yMin > yMax) {
      yMin = 0;
      yMax = Math.ceil(Math.max(...data.map(d => d[key2])) * 1.1);
    }
    let yScale = d3.scaleLinear().range([h, 0]).domain([yMin, yMax]);

    //x axis properties
    g.append('g')
      .attr('transform', 'translate(0,' + h + ')')
      .call(d3.axisBottom(xScale));

    //y axis properties
    let yStep = props.step === null ? null : props.step;
    let tickValues = [];

    // default y step
    if (yStep === null) {
      g.append('g').call(d3.axisLeft(yScale).ticks(20));
    }
    //
    else {
      //creates all tick values in array
      let i = yMin;
      while (i <= yMax) {
        tickValues = [...tickValues, i];
        i += yStep;
      }
      g.append('g').call(d3.axisLeft(yScale).tickValues(tickValues).tickFormat(d3.format(',.1f')));
    }

    // sets color based on selection
    const selectColor = i => {
      // sets bar to red if selected
      if (props.selection.includes(i)) {
        return '#FF0000';
      }
      // default color
      return '#2296F3';
    };

    // update selection state
    const colorSelected = i => {
      // deselects bar if already selected
      if (props.selection.includes(i)) {
        const newSelected = props.selection.filter(e => e !== i);
        props.setSelection(newSelected);
      }
      // selects bar
      else {
        props.setSelection(prevSelected => [...prevSelected, i]);
      }
      // remove hover
      d3.select(`#toolTip${i}`).remove();
    };

    //toolTip for hover
    let toolTip = (s, d, i) => {
      let t = d3
        .select('body')
        .append('text')
        .attr('id', `toolTip${i}`)
        .text(s)
        .style('font-size', '12px')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('top', yScale(d[key2]) + 85 + 'px')
        .style('left', xScale(d[key1]) + 50 + 'px');
      return t;
    };

    //iterates through array and creates bar graph based on data
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d[key1]))
      .attr('y', d => yScale(d[key2]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => h - yScale(d[key2]))
      .style('fill', (d, i) => selectColor(i))
      .on('click', (e, d) => colorSelected(d.id))
      .on('mouseover', (e, d) => {
        toolTip(`${key2}: ${d[key2]}`, d, d.id).style('visibility', 'visible');
      })
      .on('mouseout', (e, d) => {
        d3.select(`#toolTip${d.id}`).remove();
      });
    g.exit().remove();
  });

  // header info for table
  const header = [
    {
      field: key1,
      headerName: key1,
      width: 150
    },
    {
      field: key2,
      headerName: key2,
      width: 150
    }
  ];
  // adds id to data
  data.map((row, i) => {
    return (row['id'] = i);
  });

  //gets array of selected based on id
  const select = item => {
    props.setSelection(item);
  };
  BarChart.propTypes = {
    json: PropTypes.object,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    selection: PropTypes.array,
    setSelection: PropTypes.func
  };

  return (
    <div id="graph">
      <svg id="svg" ref={ref} height="500" width="600"></svg>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={header}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          onSelectionModelChange={item => select(item)}
        />
      </Box>
    </div>
  );
};

export default BarChart;
