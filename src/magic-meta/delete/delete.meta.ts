import { DeleteDirective } from 'directive/delete/delete.directive';
import { RxAbility } from 'entity-interface/RxAbility';
import { JsonUnit } from 'magic/base/json-unit';

export class DeleteMeta {
  private _jsonUnit: JsonUnit;
  public directives: DeleteDirective[] = [];
  abilities: RxAbility[] = [];

  constructor(jsonUnit: JsonUnit) {
    this._jsonUnit = jsonUnit;
  }

  get entity() {
    return this._jsonUnit.key;
  }

  get ids() {
    return Array.isArray(this._jsonUnit.value)
      ? this._jsonUnit.value
      : [this._jsonUnit.value];
  }

  /*get cascades() {
    const cascadeCommand = this._jsonUnit.getCommand(TOKEN_CASCADE);
    return cascadeCommand ? cascadeCommand.value : undefined;
  }

  isCascade(relationName: string) {
    if (!this.cascades) {
      return false;
    }
    for (const relation of this.cascades) {
      if (relation === relationName) {
        return true;
      }
    }

    return false;
  }*/
}
