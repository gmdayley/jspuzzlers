var Puzzlers = {};

Puzzlers.bindPollQuestion = function(prefix, correctResponse) {
    document.querySelector("#" + prefix + " button")
        .addEventListener('click', function() {
            var code = document.querySelector("#" + prefix + " pre").innerText;
            eval(code);
            document.querySelector("#" + prefix + " li[rel='"+ correctResponse +"']").setAttribute("class", "correct");
        });
}


