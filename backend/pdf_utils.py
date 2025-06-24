import os
import uuid
import shutil
import asyncio
from fastapi import HTTPException


def create_temp_directory():
    """Create a unique temporary directory for LaTeX compilation."""
    job_id = str(uuid.uuid4())
    temp_dir = f'./temp/{job_id}'
    os.makedirs(temp_dir, exist_ok=True)
    return temp_dir


def write_latex_to_file(latex_content, temp_dir):
    """Write LaTeX content to a file in the specified directory."""
    tex_file = f"{temp_dir}/resume.tex"
    try:
        with open(tex_file, "w") as f:
            f.write(latex_content)
        return tex_file
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write LaTeX file: {str(e)}"
        )


async def run_pdflatex(tex_file, temp_dir):
    """Run pdflatex command and return process object."""
    return await asyncio.create_subprocess_exec(
        "pdflatex",
        "-interaction=nonstopmode",
        "-output-directory", temp_dir,
        tex_file,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )


async def wait_for_compilation(process, timeout=15):
    """Wait for compilation process with timeout."""
    try:
        return await asyncio.wait_for(process.communicate(), timeout)
    except asyncio.TimeoutError:
        process.kill()
        raise HTTPException(
            status_code=500,
            detail=f"LaTeX compilation timed out after {timeout} seconds"
        )


def verify_pdf_output(temp_dir, stdout, stderr, return_code):
    """Verify PDF was generated successfully."""
    pdf_file = f"{temp_dir}/resume.pdf"

    if return_code != 0 or not os.path.exists(pdf_file):
        error_output = stdout.decode() if stdout else stderr.decode()
        short_error = error_output[:500] + \
            "..." if len(error_output) > 500 else error_output
        raise HTTPException(
            status_code=500,
            detail=f"LaTeX compilation failed: {short_error}"
        )

    return pdf_file


def cleanup_temp_dir(temp_dir):
    """Clean up temporary directory."""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Failed to clean up {temp_dir}: {e}")


async def compile_pdf(sections):
    """
    Compile PDF from sections data.
    This function orchestrates the entire compilation process.
    """
    print(f"compile_pdf called with sections: {sections}")
    from latex import get_latex

    temp_dir = create_temp_directory()
    print(f"Created temp dir: {temp_dir}")

    try:
        latex_content = get_latex(sections)
        print(f"Generated LaTeX content length: {len(latex_content)}")
        tex_file = write_latex_to_file(latex_content, temp_dir)
        print(f"Written tex file: {tex_file}")
        process = await run_pdflatex(tex_file, temp_dir)
        print("pdflatex process started")
        stdout, stderr = await wait_for_compilation(process)
        print(f"Compilation finished with return code: {process.returncode}")
        pdf_path = verify_pdf_output(
            temp_dir, stdout, stderr, process.returncode)
        print(f"PDF verified at: {pdf_path}")
        return pdf_path, temp_dir

    except Exception as e:
        print(f"Error in compile_pdf: {str(e)}")
        cleanup_temp_dir(temp_dir)
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )
