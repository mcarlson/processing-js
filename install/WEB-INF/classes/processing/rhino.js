var t = request.getParameter('type');
if (t == null || t == 'lzx') {
    response.setContentType('text/xml');
    Processing.parse(code);
} else if (t == 'js') {
    response.setContentType('text');
    Processing.parsejs(code);
}
