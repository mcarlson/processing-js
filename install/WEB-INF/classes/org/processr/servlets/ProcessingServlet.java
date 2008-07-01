package org.processr.servlets;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Writer;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.EcmaError;
import org.mozilla.javascript.Scriptable;

public class ProcessingServlet extends HttpServlet {
	private String code = "";

	public void doGet(HttpServletRequest httpRequest,
			HttpServletResponse httpResponse) throws IOException {
		PrintWriter out = httpResponse.getWriter();
		httpResponse.setContentType("text/html");
		httpResponse.setHeader("Cache-Control", "no-cache");

		// Strip context path from request URI
		String requestURI = httpRequest.getRequestURI();
		String ctxPrefix = httpRequest.getContextPath();
		if (ctxPrefix.length() < requestURI.length()
				&& requestURI.startsWith(ctxPrefix)
				&& requestURI.charAt(ctxPrefix.length()) == '/') {
			// some path below context root
			requestURI = requestURI.substring(ctxPrefix.length());
		}

		// Read user code
		String inputfilename = getServletContext().getRealPath(requestURI);
		InputStream filereader = new FileInputStream(new File(inputfilename));
		String usercode = readFileAsString(filereader);

		String result = "";

		// Invoke Rhino
		try {
			Context context = Context.enter();
			Scriptable scope = context.initStandardObjects();
			Scriptable jsArgs1 = Context.toObject(out, scope);
			Scriptable jsArgs2 = Context.toObject(httpRequest, scope);
			Scriptable jsArgs3 = Context.toObject(httpResponse, scope);
			Scriptable jsArgs4 = Context.toObject(usercode, scope);
			scope.put("out", scope, jsArgs1);
			scope.put("request", scope, jsArgs2);
			scope.put("response", scope, jsArgs3);
			scope.put("code", scope, jsArgs4);
			Object resultObj = context.evaluateString(scope, code,
					"JAVASCRIPT-CODE", 1, null);
			result = context.toString(resultObj);
		} catch (EcmaError e) {
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PrintWriter pw = new PrintWriter(baos);
			e.printStackTrace(pw);
			pw.flush();

			out.println("<html><body><pre>");
			out.println("Exception caused by serverside"
					+ " script execution:\n");
			out.println(new String(baos.toByteArray()));
			out.println("</pre></body></html>".getBytes());
		} finally {
			Context.exit();
		}

		// change .processing -> .lzx
		String outname = inputfilename
				.substring(0, inputfilename.length() - 10)
				+ "lzx";

		// use buffering
		Writer output = new BufferedWriter(new FileWriter(new File(outname)));
		try {
			// FileWriter always assumes default encoding is OK!
			output.write(result);
		} finally {
			output.close();
		}

		// Send redirect to newly created lzx file
		String redirectto = httpRequest.getRequestURI();
		redirectto = redirectto.substring(0, redirectto.length() - 10) + "lzx";
		httpResponse.sendRedirect(redirectto);

		out.flush();
		out.close();
	}

	public void init(ServletConfig config) throws ServletException {
		super.init(config);
		try {
			// Read parser and bootstrap code
			InputStream is = getClass().getClassLoader().getResourceAsStream(
					"processing/parser.js");
			code = readFileAsString(is);
			InputStream is2 = getClass().getClassLoader().getResourceAsStream(
					"processing/rhino.js");
			code += readFileAsString(is2);
		} catch (IOException e) {
		}
	}

	private static String readFileAsString(InputStream is)
			throws java.io.IOException {
		StringBuffer fileData = new StringBuffer(1000);
		BufferedReader reader = new BufferedReader(new InputStreamReader(is));

		char[] buf = new char[1024];
		int numRead = 0;
		while ((numRead = reader.read(buf)) != -1) {
			fileData.append(buf, 0, numRead);
		}
		reader.close();
		return fileData.toString();
	}

}
