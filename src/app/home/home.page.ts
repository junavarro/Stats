import { Component, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import * as d3 from 'd3';
interface DataModel {
  date: string;
  frequency: number;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnChanges {
  @ViewChild('chart', {read: ElementRef,static: false}) chartContainer: ElementRef;
  items: Observable<any[]>;
  countList: any;
  itemsLength: number = 0;
  data: [DataModel];
  margin = { top: 20, right: 20, bottom: 30, left: 40 };


  constructor(db: AngularFirestore) {
    this.items = db.collection('items').valueChanges();
    db.collection('items').valueChanges().subscribe((data: [any]) => {
      console.log(data.length);
      this.itemsLength = data.length;
      var result = {};
      let freqValues = [];
      data.forEach((i) => {
        let temp = freqValues.find((ele) => ele.date = i.date);
        if (temp) {
          temp.frequency += 1 / this.itemsLength;
        } else {
          freqValues.push({ date: i.date, frequency: 1 / this.itemsLength });
        }
        // if (!result.hasOwnProperty(i.date)) {
        //   result[i.date] = 1/this.itemsLength;
        // }
        // else {
        //   result[i.date] += 1/this.itemsLength;
        // }
      });
      this.countList = freqValues;
      //console.log(freqValues);
      this.data= this.countList;
      this.createChart();

    })

  }

  ngOnChanges() {

    if (!this.data) { return; }

    this.createChart();
  }
  private createChart(): void {
    d3.select('svg').remove();

    const element = this.chartContainer.nativeElement;
    const data = this.data;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(this.data.map(d => d.date));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(this.data, d => d.frequency)]);

    const g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(10, '%'))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date))
      .attr('y', d => y(d.frequency))
      .attr('width', x.bandwidth())
      .attr('height', d => contentHeight - y(d.frequency));
  }
}
