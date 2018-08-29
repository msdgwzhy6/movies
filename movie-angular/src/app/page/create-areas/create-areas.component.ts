import { Component, OnInit, Output } from '@angular/core';
import { trigger,state,style,animate,transition} from '@angular/animations';
import { FormArray, FormBuilder, FormGroup,Validators} from '@angular/forms';
import { ForbiddenNameValidor } from '../../shared/forbidden-name.directive';
import { ServiceService } from '../../service/service.service';
import { Pagination } from "../../common/pagination/pagination";
import { Modal } from '../../common/modal/modal';
import { Area } from './area';

@Component({
  selector: 'app-create-areas',
  templateUrl: './create-areas.component.html',
  styleUrls: ['./create-areas.component.css'],
  animations:[
    trigger('panel-left',[
      state('inactive', style({
        left:'-400px'
      })),
      state('active',   style({
        left:'0'
      })),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ]),
  ]
})
export class CreateAreasComponent implements OnInit {
  @Output()
  public pagination:Pagination = Pagination.defaultPagination;
  public modal:Modal = Modal.modal;
  public area:Area = Area.defaultArea;
  private state:string;
  private areaList:Array<any>;
  private total:number;
  areasForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    public service:ServiceService
  ) {
    this.createAreasForm();
  }

  ngOnInit() {
    this.state = 'inactive';
    this.initList();
    this.pagination.changePage = (()=>{
      this.initList();
    });
    
  }
  //弹框出现;
  private alertModalItem(id:string){
    this.modal.close = true;
    this.modal.tips = "是否删除该项？";
    this.modal.id = id;
    this.modal.changeEvent=((id:string)=>{
      this.deleteAreaItem(id);
    })
  }
  
  //删除一条记录;
  private deleteAreaItem(id:string){
    this.modal.flag = true;
    this.modal.tips = "正在删除，请稍后...";
    const param = {
      "id":id
    }
    this.service.deleteAreaOne(param).subscribe(res=>{
      let data = JSON.parse(res["_body"]);
      if(data.code == 0){
        this.modal.tips = "删除成功！";
        $("#tipModal").modal('hide');
        this.modal.flag = false;
        this.initList();
      }
    })
  }
  //获取数据列表;
  private initList():void{
    const param = {
      "page":this.pagination.currentPage,
      "limit":this.pagination.pageItems
    }
    this.service.getAreasList(param).subscribe(res=>{
      let data = JSON.parse(res["_body"]);
      if(data.code == 0){
        this.areaList = data.data.list;
        this.total = data.data.total;
        this.pagination.totalItems = this.total;
      }
    });
  }
  //表单验证；
  createAreasForm(){
    this.areasForm = this.fb.group({
      areaType:['',[Validators.required,ForbiddenNameValidor(/^[0-9]*$/)]],
      areaTitle:['',[Validators.required]]
    })
  }
  //新增地域
  createArea(id:string){
    console.log(id);
    const area = this.areasForm.get('areaType').value;
    const title = this.areasForm.get('areaTitle').value;
    const Area = {
      'id':id,
      'area':area,
      'title':title
    }
    this.service.createAreaItem(Area).subscribe(res=>{
      const body = JSON.parse(res["_body"]);
      if(body["code"] == 0){
        this.closePanel();
        this.areasForm.reset();
        this.pagination.currentPage = Math.round(body["data"]/this.pagination.pageItems);
        this.initList();
      }
    })
  }
  //获取id对应的地域
  getAreaItem(id:string){
    const param = {
      "id":id,
    }
    return this.service.getAreaOne(param);
  }
  addPanel(){
    this.area.id = "";
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
  updatePanel(id:string){
    this.getAreaItem(id).subscribe(res=>{
      let data = JSON.parse(res["_body"]);
      if(data.code == 0){
        const Area = data.data;
        this.area.id = Area.id;
        this.area.area = Area.area;
        this.area.title = Area.title;
        this.state = this.state === 'active' ? 'inactive' : 'active';
      }
    });
  }
  closePanel(){
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
}
