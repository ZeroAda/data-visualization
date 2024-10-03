import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import * as d3 from 'd3';
import wellknown from 'wellknown';

export default function Visualization() {
  const [year, setYear] = useState(2023);
  const [seriesName, setSeriesName] = useState('All');
  const [country, setCountry] = useState('All');
  const [meltedData, setMeltedData] = useState([]);
  const [percentageData, setPercentageData] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  // Fetch data
  useEffect(() => {
    Promise.all([
      d3.csv('/data/melted_new_data.csv'),
      d3.csv('/data/percentage_data_new.csv'),
    ]).then(([meltedDataRaw, percentageDataRaw]) => {
      // Process meltedData
      const meltedDataProcessed = meltedDataRaw.map((d) => ({
        ...d,
        Year: +d.Year,
        Value: +d.Value,
        geometry: wellknown.parse(d.geometry),
      }));

      setMeltedData(meltedDataProcessed);

      // Extract unique series names and countries
      const seriesSet = new Set(meltedDataProcessed.map((d) => d['Series Name']));
      setSeriesOptions(['All', ...Array.from(seriesSet)]);

      const countrySet = new Set(meltedDataProcessed.map((d) => d.Name));
      setCountryOptions(['All', ...Array.from(countrySet)]);

      // Process percentageData
      const percentageDataProcessed = percentageDataRaw
        .map((d) => ({
          ...d,
          Year: +d.Year,
          Value: d.Value !== '' ? +d.Value : null, // Handle empty strings
        }))
        .filter((d) => d.Value !== null); // Remove entries with null Value

      setPercentageData(percentageDataProcessed);
    });
  }, []);

  // Visualization components
  useEffect(() => {
    if (meltedData.length === 0 || percentageData.length === 0) return;

    // Clear previous SVGs or content
    d3.select('#map').selectAll('*').remove();
    d3.select('#lineChart').selectAll('*').remove();
    d3.select('#checklist').selectAll('*').remove();
    d3.select('#ringChart').selectAll('*').remove();

    // Filter data based on selectors
    const mapData = meltedData.filter(
      (d) =>
        d.Year === year && (seriesName === 'All' || d['Series Name'] === seriesName)
    );

    const lineData = percentageData.filter(
      (d) => seriesName === 'All' || d['Series Name'] === seriesName
    );

    const ringData = percentageData.filter(
      (d) => (seriesName === 'All' || d['Series Name'] === seriesName) && d.Year === year
    );
    console.log('Ring Data for Year:', year, ringData);

    const checklistData = meltedData.filter(
      (d) => d.Year === year && d.Name === country && d['Series Name'] !== 'All'
    );

    // Draw visualizations
    drawMap(mapData);
    // drawLineChart(lineData);
    drawRingChart(ringData);
    drawChecklist(checklistData);
  }, [meltedData, percentageData, year, seriesName, country]);

  // Draw Map
  const drawMap = (data) => {
    const width = 800;
    const height = 500;

    const svg = d3
      .select('#map')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create a projection
    const projection = d3
      .geoMercator()
      .scale(100)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Create a color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

    // Tooltip
    const tooltip = d3
    .select('body') // Append to body for global positioning
    .append('div')
    .attr('class', 'tooltip');

    // Draw countries
    svg
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', (d) => path(d.geometry))
      .attr('fill', (d) => {
        if (d.Name === country) {
          // Selected country
          if (d.Value === 0) {
            return '#FFDAB9'; // Light orange
          } else {
            return '#FF8C00'; // Dark orange
          }
        } else {
          // Not selected country
          return colorScale(d.Value); // Original blue color scale
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', (d) => (d.Name === country ? 2 : 0.5))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', 'orange');
      })
      
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', colorScale(d.Value));
        
      })
      .on('click', function (event, d) {
        setCountry(d.Name);
      });
  };

  // Draw Ring Chart
  const drawRingChart = (data) => {
    const width = 400;
    const height = 400;
    const innerRadius = 50;
    const ringThickness = 7;
    const gap = 3;

    const svg = d3
      .select('#ringChart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // // Define color mapping
    // const colorMapping = {
    //   'A woman can apply for a passport in the same way as a man (1=yes; 0=no)':
    //     '#fee327',
    //   'A woman can be "head of household" in the same way as a man (1=yes; 0=no)':
    //     '#fdca54',
    //   'A woman can choose where to live in the same way as a man (1=yes; 0=no)':
    //     '#f6a570',
    //   'A woman can get a job in the same way as a man (1=yes; 0=no)': '#f1969b',
    //   'A woman can obtain a judgment of divorce in the same way as a man (1=yes; 0=no)':
    //     '#f08ab1',
    //   'A woman can open a bank account in the same way as a man (1=yes; 0=no)':
    //     '#c78dbd',
    //   'A woman can register a business in the same way as a man (1=yes; 0=no)':
    //     '#927db6',
    //   'A woman can sign a contract in the same way as a man (1=yes; 0=no)':
    //     '#5da0d7',
    //   'A woman can travel outside her home in the same way as a man (1=yes; 0=no)':
    //     '#00b3e1',
    //   'A woman can travel outside the country in the same way as a man (1=yes; 0=no)':
    //     '#50bcbf',
    //   'A woman can work at night in the same way as a man (1=yes; 0=no)': '#65bda5',
    //   'A woman can work in a job deemed dangerous in the same way as a man (1=yes; 0=no)':
    //     '#87bf54',
    //   'A woman can work in an industrial job in the same way as a man (1=yes; 0=no)':
    //     '#f1969b',
    //   'A woman has the same rights to remarry as a man (1=yes; 0=no)': '#c78dbd',
    // };

    // // Sort data to maintain consistent ring order
    // const filteredData = data.filter((d) => d['Series Name'] !== 'All');
    // filteredData.sort((a, b) => d3.descending(a.Value, b.Value));
    // Define color mapping with the new color scheme
    const colorMapping = {
      'A woman can apply for a passport in the same way as a man (1=yes; 0=no)': '#bb5471',
      'A woman can be "head of household" in the same way as a man (1=yes; 0=no)': '#c16075',
      'A woman can choose where to live in the same way as a man (1=yes; 0=no)': '#c76c7a',
      'A woman can get a job in the same way as a man (1=yes; 0=no)': '#cc7980',
      'A woman can obtain a judgment of divorce in the same way as a man (1=yes; 0=no)': '#d18486',
      'A woman can open a bank account in the same way as a man (1=yes; 0=no)': '#d6908d',
      'A woman can register a business in the same way as a man (1=yes; 0=no)': '#db9c95',
      'A woman can sign a contract in the same way as a man (1=yes; 0=no)': '#dfa89e',
      'A woman can travel outside her home in the same way as a man (1=yes; 0=no)': '#e3b3a8',
      'A woman can travel outside the country in the same way as a man (1=yes; 0=no)': '#e7bfb3',
      'A woman can work at night in the same way as a man (1=yes; 0=no)': '#ebcabe',
      'A woman can work in a job deemed dangerous in the same way as a man (1=yes; 0=no)': '#f0d6ca',
      'A woman can work in an industrial job in the same way as a man (1=yes; 0=no)': '#f4e1d7',
      'A woman has the same rights to remarry as a man (1=yes; 0=no)': '#f4e1d7'
    };
    

    // Sort filtered data based on the order in colorMapping
    const seriesOrder = Object.keys(colorMapping);

    const filteredData = data
      .filter((d) => d['Series Name'] !== 'All')
      .sort((a, b) => seriesOrder.indexOf(a['Series Name']) - seriesOrder.indexOf(b['Series Name']));


    const numRings = filteredData.length;
    const totalRadius = innerRadius + numRings * (ringThickness + gap);

    // Arc generator
    const arc = d3
      .arc()
      .innerRadius((d, i) => innerRadius + i * (ringThickness + gap))
      .outerRadius(
        (d, i) => innerRadius + ringThickness + i * (ringThickness + gap)
      )
      .startAngle(0);

    // Background arcs (unfilled portion)
    svg
      .selectAll('.backgroundArc')
      .data(filteredData)
      .enter()
      .append('path')
      .attr('class', 'backgroundArc')
      .attr('d', (d, i) => {
        const fullArc = { endAngle: 2 * Math.PI };
        return arc(fullArc, i);
      })
      .attr('fill', '#e6e6e6');

    // Foreground arcs (filled proportion)
    svg
      .selectAll('.foregroundArc')
      .data(filteredData)
      .enter()
      .append('path')
      .attr('class', 'foregroundArc')
      .attr('d', (d, i) => {
        const currentArc = { endAngle: 2 * Math.PI * d.Value };
        return arc(currentArc, i);
      })
      .attr('fill', (d) => colorMapping[d['Series Name']])
      .on('mouseover', function (event, d) {
        // Highlight the hovered arc
        d3.select(this).transition().duration(200).attr('opacity', 0.7);

        // Process the Series Name to remove '(1=yes; 0=no)'
        const seriesName = d['Series Name'].split(' (')[0];

        // Update center text
        centerTextLine1
          .text('Globally,')
          .style('font-size', '12px')
          .style('fill', 'grey');

        centerTextLine2
          .text((d.Value * 100).toFixed(1) + '%')
          .style('font-size', '24px')
          .style('fill', 'black');

        centerTextLine3
          .text(seriesName)
          .style('font-size', '12px')
          .style('fill', 'grey');
      })
      .on('mouseout', function () {
        // Remove highlight
        d3.select(this).transition().duration(200).attr('opacity', 1);

        // Reset center text
        centerTextLine1.text('');
        centerTextLine2.text('');
        centerTextLine3.text('');
      });

    // Center Text Lines
    const centerTextGroup = svg.append('g');

    const centerTextLine1 = centerTextGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em');

    const centerTextLine2 = centerTextGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.6em');

    const centerTextLine3 = centerTextGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.4em');
    // if series name is not all, show centerTextLine
    if (seriesName !== 'All') {
      centerTextLine1
          .text('Globally,')
          .style('font-size', '12px')
          .style('fill', 'grey');

      centerTextLine2
        .text((data[0].Value * 100).toFixed(1) + '%')
        .style('font-size', '24px')
        .style('fill', 'black');

      centerTextLine3
        .text(seriesName.split(' (')[0])
        .style('font-size', '12px')
        .style('fill', 'grey');
    }
  };

  // Add the drawChecklist function
  const drawChecklist = (data) => {
    // Clear previous content
    d3.select('#checklist').html('');

    // Create a container
    const container = d3
      .select('#checklist')
      .append('div')
      .attr('class', 'checklist-container');

    // Sort data alphabetically by Series Name
    data.sort((a, b) => d3.ascending(a['Series Name'], b['Series Name']));

    // Create an item for each right
    const items = container
      .selectAll('.checklist-item')
      .data(data)
      .enter()
      .append('div')
      .attr('class', 'checklist-item');

    // Add indicator (checkmark or cross)
    items
      .append('span')
      .attr('class', 'indicator')
      .html((d) => (d.Value === 1 ? '✅ ' : '❌ '))
      .style('color', (d) => (d.Value === 1 ? 'green' : 'red'));

    // Add the right's description
    items
      .append('span')
      .attr('class', 'right-description')
      .text((d) => d['Series Name'].split(' (')[0]);

    // Optional: Add tooltip or additional info on hover
    items
      .on('mouseover', function () {
        d3.select(this).style('background-color', '#f0f0f0');
      })
      .on('mouseout', function () {
        d3.select(this).style('background-color', null);
      });
  };

  // Compute percentage for the title
  const computePercentage = () => {
    if (country !== 'All' && seriesName !== 'All') {
      const dataPoint = meltedData.find(
        (d) =>
          d.Name === country &&
          d.Year === year &&
          d['Series Name'] === seriesName
      );
      if (dataPoint) {
        return (dataPoint.Value * 100).toFixed(1);
      }
    }
    return null;
  };

  return (
    <Layout>
      <Head>
        <title>Visualization</title>
      </Head>
      <div className="centered-content">
        
      <h1>Gender Equality Statistics around the World</h1>
      
      <h2>Data source: <a href="https://datacatalog.worldbank.org/search/dataset/0037654/Gender-Statistics" target="_blank">DataBank</a>
      </h2>
      </div>
      
      
      <div className="centered-content">
      {/* Selectors */}
      <div className="selectors">
        {/* Year Slider */}
        <label>
          <strong>Year:</strong> {year}
          <input
            type="range"
            min="1970"
            max="2023"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
          />
        </label>

        {/* Series Name Selector */}
        <label>
          <strong>Perspective:</strong>
          <select
            className="perspective-select"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
          >
            {seriesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        

        {/* Country Selector */}
        <label>
          <strong>Country:</strong>
          <select
            className="country-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      </div>

      {/* Title */}
      <h2>
        {country !== 'All' && seriesName !== 'All' && computePercentage() !== null
          ? `In ${country}, it is ${computePercentage()}% True that "${seriesName.split(' (')[0]}" in ${year}`
          : 'Select a country and perspective to see details'}
      </h2>

      {/* Visualization Containers */}
      <div className="visualization-container">
        <div id="map"></div>
        <div id="ringChart"></div>
      </div>

      <h2>
        {country !== 'All'
          ? `In ${country} in ${year}`
          : 'Select a country to see which rights are realized'}
      </h2>
      <div id="checklist"></div>

      {/* Styles */}
      <style jsx>{`
        .centered-content {
          text-align: center; /* Center text content */
          max-width: 2000px;
          margin: 0 auto; /* Center the entire content horizontally */
        }
        .selectors {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          margin-bottom: 20px;
          align-items: center; /* Ensure vertical alignment */
          justify-content: center; /* Center the selectors */
        }
        label {
          display: flex;
          flex-direction: column;
          font-size: 16px;
          color: #333; /* Slightly darker color for labels */
        }
        input[type='range'] {
          width: 200px;
        }
        select {
          width: 200px;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ccc; /* Make the dropdowns cleaner */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
        }
        .perspective-select {
          width: 550px;
        }
        .country-select {
          width: 100px;
        }
        h1 {
          font-size: 32px; /* Larger for more impact */
          color: #111; /* Slightly darker */
          margin-bottom: 30px;
        }

        h2 {
          margin-top: 20px;
          font-size: 20px;
          font-weight: 400;
          color: #444; /* Lighter to give a subtle hierarchy */
        }
        .visualization-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-top: 30px;
          gap: 50px; /* Added gap to create space between map and ring chart */
        }
        #map {
          flex: 2; /* Larger flex value to take up more space */
          min-width: 500px; /* Increase the minimum width for the map */
          height: 450px; /* Increased height for better visibility */
          padding: 20px;
          background-color: #fff;
          border-radius: 3px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        #ringChart {
          flex: 1; /* Smaller flex value to take up less space */
          min-width: 300px;
          height: 450px; /* Keep the height consistent */
          padding: 20px;
          background-color: #fff;
          border-radius: 3px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tooltip {
          position: absolute;
          text-align: left;
          width: auto;
          padding: 8px;
          font-size: 14px;
          background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
          color: #fff; /* White text for contrast */
          border-radius: 4px;
          pointer-events: none; /* Ensures the tooltip doesn't interfere with mouse events */
          opacity: 0; /* Initially hidden */
          display: none; /* Initially not displayed */
          transition: opacity 0.2s ease, left 0.1s, top 0.1s; /* Smooth transitions */
          z-index: 9999; /* Ensures it is above other elements */
        }

        .checklist-container {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          font-size: 18px; /* Slightly larger font for better readability */
          gap: 10px;
        }
        .checklist-item {
          display: flex;
          align-items: center;
          font-size: 16px;
        }
        .indicator {
          font-size: 22px;
          margin-right: 10px;
        }
        .right-description {
          flex: 1;
          font-weight: 500; /* Slightly bolder */
        }
      `}</style>
    </Layout>
  );
}
