module.exports = function (/* { file, options, env } */) {
    return {
        plugins: [
            require('postcss-cssnext')()
        ]
    };
};
