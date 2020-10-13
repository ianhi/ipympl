# ipympl

[![TravisCI build status](https://img.shields.io/travis/com/matplotlib/ipympl/master?logo=travis)](https://travis-ci.com/matplotlib/ipympl)
[![Latest PyPI version](https://img.shields.io/pypi/v/ipympl?logo=pypi)](https://pypi.python.org/pypi/ipympl)
[![Latest conda-forge version](https://img.shields.io/conda/vn/conda-forge/ipympl?logo=conda-forge)](https://anaconda.org/conda-forge/ipympl)
[![Latest npm version](https://img.shields.io/npm/v/jupyter-matplotlib?logo=npm)](https://www.npmjs.com/package/jupyter-matplotlib)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/matplotlib/ipympl/stable?urlpath=%2Flab%2Ftree%2Fexamples%2Fipympl.ipynb)
[![Gitter](https://img.shields.io/badge/gitter-Join_chat-blue?logo=gitter)](https://gitter.im/jupyter-widgets/Lobby)

Leveraging the Jupyter interactive widgets framework, `ipympl` enables the interactive features of matplotlib in the Jupyter notebook and in JupyterLab.

Besides, the figure `canvas` element is a proper Jupyter interactive widget which can be positioned in interactive widget layouts.

## Usage

To enable the `ipympl` backend, simply use the `matplotlib` Jupyter
magic:

```
%matplotlib widget
```

## Example
See the [example notebook](https://github.com/matplotlib/ipympl/blob/master/examples/ipympl.ipynb) for more!

![matplotlib screencast](matplotlib.gif)

## Installation

### With conda:

```bash
conda install -c conda-forge ipympl
```

### With pip:

```bash
pip install ipympl
```

### Use in JupyterLab

If you want to use ipympl in JupyterLab, we recommend using JupyterLab >= 3.

### For a development installation (requires nodejs):

```bash
git clone https://github.com/matplotlib/ipympl.git
cd ipympl
pip install -e .

# If using classic Jupyter Notebook
jupyter nbextension install --py --symlink --sys-prefix ipympl
jupyter nbextension enable --py --sys-prefix ipympl

# If using JupyterLab
jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
jupyter labextension install ./js
```

#### How to see your changes
**Javascript**:

To continuously monitor the project for changes and automatically trigger a rebuild, start Jupyter in watch mode:

```bash
jupyter lab --watch
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

**Python:**

If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.
