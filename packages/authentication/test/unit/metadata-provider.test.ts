// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {CoreBindings} from '@loopback/core';
import {Context, Provider} from '@loopback/context';
import {
  AuthMetadataProvider,
  AuthenticationMetadata,
  authenticate,
} from '../..';

describe('AuthMetadataProvider', () => {
  let provider: Provider<AuthenticationMetadata | undefined>;

  class TestController {
    @authenticate('my-strategy', {option1: 'value1', option2: 'value2'})
    whoAmI() {}
  }

  class ControllerWithNoMetadata {
    whoAmI() {}
  }

  beforeEach(givenAuthMetadataProvider);

  describe('value()', () => {
    it('returns the auth metadata of a controller method', async () => {
      const authMetadata:
        | AuthenticationMetadata
        | undefined = await provider.value();
      expect(authMetadata).to.be.eql({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      });
    });

    describe('context.get(provider_key)', () => {
      it('returns the auth metadata of a controller method', async () => {
        const context: Context = new Context();
        context.bind(CoreBindings.CONTROLLER_CLASS).to(TestController);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.eql({
          strategy: 'my-strategy',
          options: {option1: 'value1', option2: 'value2'},
        });
      });

      it('returns undefined if no auth metadata is defined', async () => {
        const context: Context = new Context();
        context
          .bind(CoreBindings.CONTROLLER_CLASS)
          .to(ControllerWithNoMetadata);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });
    });
  });

  function givenAuthMetadataProvider() {
    provider = new AuthMetadataProvider(TestController, 'whoAmI');
  }
});
