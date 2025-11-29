import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'light',
  brandTitle: 'puzzlecules',
  brandImage: undefined,
});

addons.setConfig({
  theme,
});
