import { CommandMeta } from './command-meta';
import { JsonUnitMeta } from './json-unit-meta';
import { ModelUnitMeta } from './model-unit-meta';
import { RelationMeta } from './relation-meta';
import { TOKEN_MODEL } from './keyword_tokens';
import { WhereMeta } from './where-meta';

export class MagicQueryParamsParser {
  private json: any;
  modelUnit: ModelUnitMeta;
  takeCommand = 'getMany';
  fieldCommands: {
    [key: string]: CommandMeta[];
  };
  relations: RelationMeta[];
  whereMeta: WhereMeta;

  constructor(jsonStr: string) {
    this.json = JSON.parse(jsonStr || '{}');
    for (const keyStr in this.json) {
      const value = this.json[keyStr];
      const jsonUnit = new JsonUnitMeta(keyStr, value);
      if (jsonUnit.key.toLowerCase() === TOKEN_MODEL) {
        this.modelUnit = new ModelUnitMeta(jsonUnit);
        break;
      }
      if (jsonUnit.isRlationShip()) {
        break;
      }
    }
  }
}
