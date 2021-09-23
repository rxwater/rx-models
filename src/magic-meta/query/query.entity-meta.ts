import { QueryDirective } from 'directive/query/query.directive';
import { RxAbility } from 'entity-interface/RxAbility';
import { JsonUnit } from 'magic/base/json-unit';
import { EntityMeta } from 'schema/graph-meta-interface/entity-meta';
import { createId } from 'util/create-id';
import { AddonRelationInfo } from './addon-relation-info';
import { QueryRelationMeta } from './query.relation-meta';

export class QueryEntityMeta {
  id: number;
  entityMeta: EntityMeta;
  relations: QueryRelationMeta[] = [];
  //权限或者where sql需要用到的关联
  addonRelations: QueryRelationMeta[] = [];
  directives: QueryDirective[] = [];
  //附加关联用到的字段，如果查询中不包含这些字段，需要在结果中滤除
  addonRelationInfos: AddonRelationInfo[] = [];
  //展开，对每个属性进行设置
  expandFieldForAuth = false;
  //当前登录用户，Entity对应的Abiltity
  //根据该数据，可以衍生出方法，进行权限检查
  abilities: RxAbility[] = [];

  //关联条件，如user.id
  relationConditions: JsonUnit[] = [];

  constructor() {
    this.id = createId();
  }

  get entity() {
    return this.entityMeta.name;
  }

  get alias() {
    return this.entityMeta.name?.toLowerCase() + this.id;
  }

  getHasQueryAbilityFields() {
    return this.abilities
      .filter((ability) => ability.columnUuid)
      .map((ability) => {
        return this.entityMeta.columns.find(
          (column) => column.uuid === ability.columnUuid,
        ).name;
      });
  }

  addAddOnRelation(relationMeta: QueryRelationMeta) {
    const foundRelation = this.addonRelations.find(
      (relation) => relation.name === relationMeta.name,
    );
    //避免重复添加
    if (!foundRelation) {
      this.addonRelations.push(relationMeta);
    }
  }

  pushDirective(directive: QueryDirective) {
    this.directives.push(directive);
  }

  findRelation(relationName: string): QueryRelationMeta {
    for (const relationMeta of [...this.relations, ...this.addonRelations]) {
      if (relationMeta.name === relationName) {
        return relationMeta;
      }
    }
  }

  findRelatiOrFailed(relationName: string): QueryRelationMeta {
    const relation = this.findRelation(relationName);
    if (relation) {
      return relation;
    }
    throw new Error(
      `Please add relation ${relationName} of ${this.entity} to query meta`,
    );
  }
}
