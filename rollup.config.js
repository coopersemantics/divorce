import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import license from 'rollup-plugin-license';
import pkg from './package.json';

const banner = `
<%= pkg.name %> v<%= pkg.version %>
Copyright 2018 <%= pkg.author %>
Available under <%= pkg.license %> license <https://github.com/coopersemantics/divorce/blob/master/LICENSE>
`;

export default {
  input: 'lib/divorce.js',
  plugins: [
    resolve(),
    commonjs(),
    license({ banner }),
  ],
  output: [
    {
      format: 'cjs',
      name: 'divorce',
      file: pkg.main,
      sourcemap: true,
    },
    {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
  ],
}
