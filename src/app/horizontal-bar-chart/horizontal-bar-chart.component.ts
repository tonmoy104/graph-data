import { IGraphData } from './../interface/IGraphData';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, of, combineLatest, merge, zip } from 'rxjs';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-horizontal-bar-chart',
  templateUrl: './horizontal-bar-chart.component.html',
  styleUrls: ['./horizontal-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HorizontalBarChartComponent implements OnInit {
  public maxValue: number;
  public minValue: number;
  public years$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  public yearControl: FormControl;
  private readonly rowData: IGraphData[] = [];

  public ngOnInit(): void {
    this.readFromCSVData();
  }

  public changeYear(): void{
    const filteredRows = this.rowData.filter( x => x.year === this.yearControl.value);
    this.BarChart(this.getFormattedData(filteredRows), 'renewables', 'state');
  }

  private readFromCSVData(): void {
    d3.csv('../../assets/interactive_data.csv').then((data) => {
      data.forEach((x): number =>
        this.rowData.push({
          year: new Date(x.date).getFullYear(),
          state: x.state,
          renewables: parseFloat(x.renewables),
        })
      );
      const years = [...new Set(this.rowData.map(item => item.year))];
      this.years$.next(years);
      this.maxValue = Math.max(...years);
      this.minValue = Math.max(...years);
      this.yearControl = new FormControl(this.maxValue);
      this.changeYear();
    });

  }

  private getFormattedData(data: IGraphData[]): IGraphData[]{
    const formattedResult = [];
    data.reduce((res, value) => {
        if (!res[value.state]) {
          res[value.state] = {
            renewables: 0,
            state: value.state,
          };
          formattedResult.push(res[value.state]);
        }
        res[value.state].renewables += value.renewables;
        return res;
      }, {});
    return formattedResult;

  }


  private BarChart(data: IGraphData[], XProp: string, YProp: string): SVGSVGElement {
    const X = d3.map(data, (d) => d[XProp]);
    const Y = d3.map(data, (d) => d[YProp]);
    // Declarations
    let title;
    let xDomain;
    let yDomain: any;
    let height: any;

    const marginTop = 30; // the top margin, in pixels
    const marginRight = 0; // the right margin, in pixels
    const marginBottom = 10; // the bottom margin, in pixels
    const marginLeft = 30; // the left margin, in pixels
    const width = 640; // the outer width of the chart, in pixels
    let yRange: any;
    const yPadding = 0.1;
    const xType = d3.scaleLinear;
    const xRange = [marginLeft, width - marginRight];
    const color = 'steelblue'; // bar fill color
    const titleColor = 'white'; // title fill color when atop bar
    const titleAltColor = 'currentColor';
    const xFormat = undefined;

    if (xDomain === undefined) { xDomain = [0, d3.max(X)]; }
    if (yDomain === undefined) { yDomain = Y; }
    yDomain = new d3.InternSet(yDomain);

    // Omit any data not present in the y-domain.
    const I = d3.range(X.length).filter((i) => yDomain.has(Y[i]));

    // Compute the default height.
    if (height === undefined) {
      height =
        Math.ceil((yDomain.size + yPadding) * 25) + marginTop + marginBottom;
    }
    if (yRange === undefined) { yRange = [marginTop, height - marginBottom]; }

    // Construct scales and axes.
    const xScale = d3.scaleLinear(xDomain, xRange);
    // const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding);
    const yScale = d3
      .scaleBand()
      .domain(Y)
      .range([marginTop, height - marginBottom])
      .padding(0.2);
    const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    // Compute titles.
    if (title === undefined) {
      const formatValue = xScale.tickFormat(100, xFormat);
      title = (i) => `${formatValue(X[i])}`;
    }
    d3.select('figure#bar').select('svg').remove();
    const svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    svg
      .append('g')
      .attr('transform', `translate(0,${marginTop})`)
      .call(xAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('y2', height - marginTop - marginBottom)
          .attr('stroke-opacity', 0.1)
      )
      .call((g) =>
        g
          .append('text')
          .attr('x', width - marginRight)
          .attr('y', -22)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'end')
          .text('Sum(Renewables)')
      );

    svg
      .append('g')
      .attr('fill', color)
      .selectAll('rect')
      .data(I)
      .join('rect')
      .attr('x', xScale(0))
      .attr('y', (i) => yScale(Y[i]))
      .attr('width', (i) => xScale(X[i]) - xScale(0))
      .attr('height', yScale.bandwidth());

    svg
      .append('g')
      .attr('fill', titleColor)
      .attr('text-anchor', 'end')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('text')
      .data(I)
      .join('text')
      .attr('x', (i) => xScale(X[i]))
      .attr('y', (i) => yScale(Y[i]) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('dx', -4)
      .text(title)
      .call((text) =>
        text
          .filter((i) => xScale(X[i]) - xScale(0) < 20) // short bars
          .attr('dx', +4)
          .attr('fill', titleAltColor)
          .attr('text-anchor', 'start')
      );

    svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(yAxis);

    return svg.node();
  }
}
