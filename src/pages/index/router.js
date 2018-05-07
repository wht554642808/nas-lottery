const main = r => require.ensure([], () => r(require('./main.vue')), 'index.chunk');
export default  {
    path: '/index/:id',
    level: 1,
    component: main
};