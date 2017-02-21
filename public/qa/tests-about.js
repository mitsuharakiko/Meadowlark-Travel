suite("'About' Page Tests",function(){
    test("page should contain link tp contact page",function(){
        assert($('a[href="/contact"]').length);
    });
});