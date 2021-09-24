import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

export interface PeriodicElement {
  id: string;
  name: string;
  email: string;
  role: string;
  edit: boolean;
  position: number;
}

/**
 * @title Table with selection
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  checked: boolean;
  indeterminate: boolean;
  pageSize = 10;
  displayedColumns: string[] = ['select', 'name', 'email', 'role', 'actions'];

  pageEvent: PageEvent;

  fetchApi =
    'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

  dataSource: MatTableDataSource<PeriodicElement>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  selection: SelectionModel<PeriodicElement>;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.checked = false;
    this.indeterminate = false;
    this.httpClient.get(this.fetchApi).subscribe((data: any) => {
      data.forEach((element, index) => {
        element.edit = false;
        element.position = index + 1;
      });
      const ELEMENT_DATA: PeriodicElement[] = data;
      this.dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
      this.selection = new SelectionModel<PeriodicElement>(true, []);
      this.dataSource.paginator = this.paginator;
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection?.selected?.length;
    const page = this.dataSource?.paginator?.pageSize;
    return numSelected === page;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.selectRows();
  }

  selectRows() {
    let i =
      this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize;
    let end =
      (this.dataSource.paginator.pageIndex + 1) *
      this.dataSource.paginator.pageSize;
    for (i; i < end; i++) {
      this.selection.select(this.dataSource.data[i]);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteRow(index: number) {
    this.dataSource.data.splice(index, 1);
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.dataSource.data
    );
    this.selection = new SelectionModel<PeriodicElement>(true, []);
    setTimeout(() => (this.dataSource.paginator = this.paginator), 0);
  }

  editRow(index: number) {
    this.dataSource.data[index].edit = true;
  }

  saveRow(index: number) {
    this.dataSource.data[index].edit = false;
  }

  editRowValue(index, key, event) {
    if (key == 'name') this.dataSource.data[index].name = event.target.value;
    else {
      if (key == 'email')
        this.dataSource.data[index].email = event.target.value;
      else {
        if (key == 'role')
          this.dataSource.data[index].role = event.target.value;
      }
    }
  }

  deleteSelected() {
    this.dataSource.data = this.dataSource.data.filter(
      (el) => !this.selection?.selected.includes(el)
    );
    this.selection = new SelectionModel<PeriodicElement>(true, []);
  }
}
